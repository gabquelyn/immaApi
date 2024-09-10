import { Request, Response } from "express";
import University from "../model/university";
import Scholarship from "../model/scholarship";
import expressAsyncHandler from "express-async-handler";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { CustomRequest } from "../../types";
export const createScholarShip = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const existingUniversity = await University.findById(
      (req as CustomRequest).id
    );
    if (!existingUniversity)
      return res.status(404).json({ message: "Uninversity not found" });
    if (!req.file)
      return res.status(400).json({ message: "Poster image missing" });
    const {
      title,
      program,
      degree,
      language,
      description,
      criteria,
      requirements,
      start,
      end,
    } = req.body;
    const s3 = new S3Client({ region: process.env.AWS_REGION });
    const fileContent = fs.readFileSync(req.file.path);
    const fileKey = `${req.file.filename}_${uuid()}`;

    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET as string,
      Body: fileContent,
      Key: fileKey,
    });
    const s3Response = await s3.send(putCommand);
    console.log(s3Response);
    fs.unlinkSync(req.file.path);
    const response = await Scholarship.create({
      university: (req as CustomRequest).id,
      poster: `https://${process.env.AWS_S3_BUCKET}.s3.eu-north-1.amazonaws.com/${fileKey}`,
      title,
      program,
      degree,
      language,
      description,
      criteria,
      requirements,
      start,
      end,
    });
    return res
      .status(201)
      .json({ message: `Scholarship created ${response._id}` });
  }
);

export const getScholarships = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const scholarships = await Scholarship.find({
      university: (req as CustomRequest).id,
    })
      .lean()
      .exec();
    return res.status(200).json([...scholarships]);
  }
);

export const deleteScholarShip = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { scholarshipId } = req.params;
    const existingUniversity = await University.findById(
      (req as CustomRequest).id
    )
      .lean()
      .exec();
    if (!existingUniversity)
      return res.status(400).json({ message: "university does not exist" });
    const flagged = await Scholarship.findOneAndDelete({
      university: existingUniversity._id,
      _id: scholarshipId,
    })
      .lean()
      .exec();
    return res.status(200).json({ message: "Successfully deleted" });
  }
);
