import e, { Response, Request } from "express";
import expressAsyncHandler from "express-async-handler";
import Token from "../model/token";
import Student from "../model/student";
import bcrypt from "bcryptjs";
import sendMail from "../utils/sendMail";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import University from "../model/university";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { Types } from "mongoose";
import { validationResult } from "express-validator";

export const loginController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email, password, type } = req.body;
    let dbPasword: string = "";
    let verified;
    let _id: Types.ObjectId;
    if (type === "university") {
      const foundUniversity = await University.findOne({ email }).lean().exec();
      if (!foundUniversity)
        return res.status(404).json({ message: "University not found" });
      dbPasword = foundUniversity.password;
      verified = foundUniversity.verified;
      _id = foundUniversity._id;
    } else if (type === "student") {
      const foundStudent = await Student.findOne({ email }).lean().exec();
      if (!foundStudent)
        return res.status(404).json({ message: "Student does not exist" });
      dbPasword = foundStudent.password;
      verified = foundStudent.verified;
      _id = foundStudent._id;
    } else return res.status(400).json({ message: "invalid account type" });

    const passwordMatch = await bcrypt.compare(password, dbPasword);
    if (!passwordMatch)
      return res.status(401).json({ message: "Unauthorized" });

    if (!verified) {
      const existingToken = await Token.findOne({
        userId: _id,
      }).exec();

      if (!existingToken) {
        const verificationToken = await Token.create({
          userId: _id,
          token: crypto.randomBytes(32).toString("hex"),
        });

        const url = `${process.env.BASE_URL}/auth/${_id}/verify/${verificationToken.token}?type=${type}`;

        await sendMail(email, "Verify email", url);
      }

      return res
        .status(400)
        .json({ message: "Email sent to your account please verify" });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: email,
          userId: _id,
          type,
        },
      },
      String(process.env.ACCESS_TOKEN_SECRET),
      { expiresIn: "1h" }
    );
    // create the refresh token
    const refreshToken = jwt.sign(
      { email, type },
      String(process.env.REFRESH_TOKEN_SECRET),
      { expiresIn: "1d" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  }
);

export const registerStudentController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const error = validationResult(req);
    if (!error.isEmpty())
      return res.status(400).json({ errors: error.array() });
    const { email, password, firstname, lastname, dob, nationality, phone } =
      req.body;
    const existing = await Student.findOne({ email }).lean().exec();
    if (existing)
      return res
        .status(409)
        .json({ message: "Student with email already in use" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Student.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      dob,
      nationality,
      phone,
    });

    if (!newUser)
      return res.status(400).json({ message: "Invalid data recieved!" });

    // verification token
    const verificationToken = await Token.create({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const url = `${process.env.FRONTEND_URL}/auth/${newUser._id}/student/verify/${verificationToken.token}`;
    // send the verification url via email
    await sendMail(newUser.email, "Verify email", url);
    res
      .status(201)
      .json({ message: "Email sent to your account please verify" });
  }
);

export const logoutController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //no content;
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: false,
      sameSite: "none",
    });
    res.json({ message: "Cookie cleared" });
  }
);

export const verifyController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { userId, token, type } = req.params;
    if (type === "university") {
      const university = await University.findById(userId).exec();
      if (!university)
        return res.status(404).json({ message: "Invalid link!" });
      const existingToken = await Token.findOne({
        userId: university._id,
        token,
      });
      if (!existingToken)
        return res.status(400).send({ message: "invalid link" });
      university.verified = true;
      await university.save();
      await existingToken.deleteOne();
    } else if (type === "student") {
      const student = await Student.findById(userId).exec();
      if (!student) return res.status(404).json({ message: "Invalid link!" });
      const existingToken = await Token.findOne({
        userId: student._id,
        token,
      });
      if (!existingToken)
        return res.status(400).send({ message: "invalid link" });
      student.verified = true;
      await student.save();
      await existingToken.deleteOne();
    } else {
      return res.status(400).json({ message: "Invalid account type" });
    }

    res.status(200).send({ message: "Email verified successfully!" });
  }
);

export const forgotPasswordController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email, type } = req.body;
    let _id: Types.ObjectId;

    if (type === "university") {
      const university = await University.findOne({ email });
      if (!university)
        return res.status(404).json({ message: "University not found!" });
      _id = university._id;
    } else if (type === "student") {
      const student = await Student.findOne({ email });
      if (!student)
        return res.status(404).json({ message: "Student not found!" });
      _id = student._id;
    } else {
      return res.status(400).json({ message: "Invalid account type" });
    }

    const existingToken = await Token.findOne({ userId: _id }).exec();
    await existingToken?.deleteOne();

    const otp = await Token.create({
      token: crypto.randomBytes(32).toString("hex"),
      userId: _id,
    });

    const url = `${process.env.FRONTEND_URL}/auth/reset/${otp.token}?type=${type}`;

    // send the verification url via email
    await sendMail(email, "Reset Password", url);
    return res
      .status(200)
      .json({ message: "Recovery mail sent successfully!" });
  }
);

export const restPasswordController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { token } = req.params;
    const { password, type } = req.body;
    const existingToken = await Token.findOne({ token }).exec();
    if (!existingToken)
      return res.status(400).send({ message: "invalid link" });

    if (type === "university") {
      const university = await University.findById(existingToken.userId).exec();
      const hashedPassword = await bcrypt.hash(password, 10);
      if (university) {
        university.password = hashedPassword;
        await university.save();
      }
    }

    if (type === "student") {
      const student = await Student.findById(existingToken.userId).exec();
      const hashedPassword = await bcrypt.hash(password, 10);
      if (student) {
        student.password = hashedPassword;
        await student.save();
      }
    }

    await existingToken.deleteOne();
    return res.status(200).json({ message: "password updated successfully!" });
  }
);

export const registerUniversityController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.status(400).json(error.array());
    const { email, password, province, zipcode, name, phone } = req.body;
    const existing = await University.findOne({ email }).lean().exec();
    if (existing)
      return res
        .status(409)
        .json({ message: "University with email already in use" });
    const hashedPassword = await bcrypt.hash(password, 10);
    if ((req.files as Express.Multer.File[]).length === 0)
      return res.status(400).json({
        message: "No document attatched to the request",
      });
    const s3 = new S3Client({ region: process.env.AWS_REGION });
    const documentKeys: string[] = [];

    for (const file of req.files as Express.Multer.File[]) {
      const fileContent = fs.readFileSync(file.path);
      const fileKey = `${file.filename}_${uuid()}`;
      try {
        const putCommand = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET as string,
          Body: fileContent,
          Key: fileKey,
        });
        const s3Response = await s3.send(putCommand);
        console.log(s3Response);
        documentKeys.push(
          `https://${process.env.AWS_S3_BUCKET}.s3.eu-north-1.amazonaws.com/${fileKey}`
        );
        fs.unlinkSync(file.path);
      } catch (err) {
        console.log(err);
      }
    }

    const newUniversity = await University.create({
      email,
      password: hashedPassword,
      province,
      zipcode,
      name,
      phone,
      documents: documentKeys,
    });

    if (!newUniversity)
      return res.status(400).json({ message: "Invalid data recieved!" });

    const verificationToken = await Token.create({
      userId: newUniversity._id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const url = `${process.env.FRONTEND_URL}/auth/${newUniversity._id}/university/verify/${verificationToken.token}`;
    // send the verification url via email
    await sendMail(newUniversity.email, "Verify email", url);
    res
      .status(201)
      .json({ message: "Email sent to your account please verify" });
  }
);

export const refreshController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cookies = req.cookies;
    if (!cookies?.jwt)
      return res.status(403).json({ message: "Unauthorized, no cookie found" });
    const refreshToken = cookies.jwt;
    // verify the refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (error: any, decoded: any) => {
        if (error) return res.status(403).json({ message: "Forbidden", error });
        let _id: Types.ObjectId;
        if (decoded.type === "university") {
          const university = await University.findOne({
            email: decoded?.email,
          });
          if (!university)
            return res.status(400).json({ message: "Unauthorized" });
          _id = university._id;
        } else {
          const student = await Student.findOne({ email: decoded?.email });
          if (!student)
            return res.status(400).json({ message: "Unauthorized" });
          _id = student._id;
        }
        // create the access token
        const accessToken = jwt.sign(
          {
            UserInfo: {
              email: decoded.email,
              userId: _id,
              type: decoded.type,
            },
          },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: "1h" }
        );
        return res.json({ accessToken });
      }
    );
  }
);
