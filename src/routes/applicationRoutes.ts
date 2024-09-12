import Router from "express";
import VerifyJWT from "../middlewares/VerifyJwt";
import {
  createApplication,
  getApplications,
  getScholarshipApplications,
} from "../controllers/applicationController";
import Multer from "multer";
const applicationRoutes = Router();
const upload = Multer({ dest: "/tmp" });
applicationRoutes.use(VerifyJWT);

/**
 * @swagger
 * /application/{schorlarshipId}:
 *   get:
 *     summary: Returns a list of the applications on a scholarships of a university.
 *     tags:
 *       - Application
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of student applications associated with a particular scholarship.
 *     parameters:
 *       - in: path
 *         name: schorlarshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the scholarship.
 *         example: 66dedcf56c91339e212e1c31
 *     responses:
 *       200:
 *         description: A list of applications with details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   scholarship:
 *                     type: string
 *                     description: The id of the scholarship.
 *                     example: 66e214b0a2349a9844e3c069
 *                   student:
 *                     type: string
 *                     description: The id of the student.
 *                     example: 66e214b0a2349a9844e3c069
 *                   education:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                          school:
 *                              type: string
 *                              description: The school name of the student
 *                              example: Some School
 *                          course:
 *                              type: string
 *                              description: The course studied by the student
 *                              example: Information systems
 *                          degree:
 *                              type: string
 *                              description: The degree of the student
 *                              example: Masters
 *                          country:
 *                              type: string
 *                              description: The country of the student
 *                              example: Nigeria
 *                          status:
 *                              type: string
 *                              description: The status of the program
 *                              example: Graduated
 *                          start:
 *                              type: string
 *                              format: date-time
 *                              description: The start of the program
 *                              example: 2024-09-11T21:42:44.554Z
 *                          end:
 *                              type: string
 *                              format: date-time
 *                              description: The end of the program
 *                              example: 2024-09-11T21:42:44.554Z
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /application:
 *   get:
 *     summary: Returns a list of the applications applied by a student.
 *     tags:
 *       - Application
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of applications associated with a particular student.
 *     responses:
 *       200:
 *         description: A list of applications with details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   scholarship:
 *                     type: string
 *                     description: The id of the scholarship.
 *                     example: 66e214b0a2349a9844e3c069
 *                   student:
 *                     type: string
 *                     description: The id of the student.
 *                     example: 66e214b0a2349a9844e3c069
 *                   education:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                          school:
 *                              type: string
 *                              description: The school name of the student
 *                              example: Some School
 *                          course:
 *                              type: string
 *                              description: The course studied by the student
 *                              example: Information systems
 *                          degree:
 *                              type: string
 *                              description: The degree of the student
 *                              example: Masters
 *                          country:
 *                              type: string
 *                              description: The country of the student
 *                              example: Nigeria
 *                          status:
 *                              type: string
 *                              description: The status of the program
 *                              example: Graduated
 *                          start:
 *                              type: string
 *                              format: date-time
 *                              description: The start of the program
 *                              example: 2024-09-11T21:42:44.554Z
 *                          end:
 *                              type: string
 *                              format: date-time
 *                              description: The end of the program
 *                              example: 2024-09-11T21:42:44.554Z
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /application/{scholarshipId}:
 *   post:
 *     summary: Apply for scholarships of a university.
 *     tags:
 *       - Application
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      school:
 *                          type: string
 *                          description: The school name of the student
 *                          example: Some School
 *                      course:
 *                          type: string
 *                          description: The course studied by the student
 *                          example: Information systems
 *                      degree:
 *                          type: string
 *                          description: The degree of the student
 *                          example: Masters
 *                      country:
 *                          type: string
 *                          description: The country of the student
 *                          example: Nigeria
 *                      status:
 *                          type: string
 *                          description: The status of the program
 *                          example: Graduated
 *                      start:
 *                          type: string
 *                          format: date-time
 *                          description: The start of the program
 *                          example: 2024-09-11T21:42:44.554Z
 *                      end:
 *                          type: string
 *                          format: date-time
 *                          description: The end of the program
 *                          example: 2024-09-11T21:42:44.554Z
 *     responses:
 *       201:
 *         description: Application submitted successfully.
 *       401:
 *         description: Unauthorised.
 *       404:
 *         description: Scholarship not found.
 *       400:
 *         description: Bad request, invalid file or missing fields.
 *       500:
 *         description: Internal server error.
 */

applicationRoutes
  .route("/:schorlarshipId")
  .post(upload.array("documents"), createApplication)
  .get(getScholarshipApplications);
applicationRoutes.route("/").get(getApplications);
export default applicationRoutes;
