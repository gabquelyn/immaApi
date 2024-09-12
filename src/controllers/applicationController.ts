import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Application from "../model/application";
import { validationResult } from "express-validator";
import { CustomRequest } from "../../types";
import { v4 as uuid } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import moment from "moment";
import Scholarship from "../model/scholarship";

export const createApplication = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    if ((req.files as Express.Multer.File[]).length === 0)
      return res.status(400).json({ message: "Missing required documents" });
    const { id, type } = req as CustomRequest;
    const { education } = req.body;
    const educationHistory: {
      school: string;
      course: string;
      degree: string;
      country: string;
      status: string;
      start: Date;
      end: Date;
    }[] = JSON.parse(education);
    const { schorlarshipId } = req.params;
    if (type !== "student")
      return res
        .status(400)
        .json({ message: "Only students can apply for scholarships" });
    const existingScholarship = await Scholarship.findById(schorlarshipId)
      .lean()
      .exec();
    if (!existingScholarship)
      return res.status(404).json({ message: "Scholarship not found" });
    if (moment(new Date()).isAfter(moment(existingScholarship.end))) {
      return res.status(406).json({ message: "Scholarship closed" });
    }
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

    const newApplication = await Application.create({
      scholarship: schorlarshipId,
      student: id,
      education: educationHistory,
      documents: documentKeys,
    });
    return res.status(201).json({
      message: `Application submitted successfully ${newApplication._id}`,
    });
  }
);

export const getApplications = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { id, type } = req as CustomRequest;
    const applications = await Application.find({ student: id })
      .populate("scholarship")
      .lean()
      .exec();
    return res.status(200).json([...applications]);
  }
);

export const getScholarshipApplications = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { schorlarshipId } = req.params;
    const { id, type } = req as CustomRequest;
    if (type !== "university")
      return res.status(400).json({ message: "Not a university" });
    const applications = await Application.find({
      scholarship: schorlarshipId,
    })
      .populate("student", "-password")
      .exec();
    return res.status(200).json([...applications]);
  }
);
