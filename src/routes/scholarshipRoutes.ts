import { Router } from "express";
import VerifyJWT from "../middlewares/VerifyJwt";
import { body } from "express-validator";
import {
  createScholarShip,
  getScholarships,
  deleteScholarShip,
} from "../controllers/uniScholarshipController";
import Multer from "multer";
import moment from "moment";
const upload = Multer({ dest: "/tmp" });

const scholarshipRoute = Router();
scholarshipRoute.use(VerifyJWT);
/**
 * @swagger
 * tags:
 *   - name: University
 *     description: Operations about universities
 */
/**
 * @swagger
 * /scholarship/university:
 *   post:
 *     summary: Create a scholarship by a university.
 *     tags:
 *       - University
 *     description: Create a scholarship by a university.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the scholarship.
 *                 example: Tetfund
 *               program:
 *                 type: string
 *                 description: The program of the scholarship.
 *                 example: Infromation Systems, AI focused.
 *               degree:
 *                 type: string
 *                 description: The degree of application in the scholarship.
 *                 example:  Masters
 *               language:
 *                 type: string
 *                 description: The scholarship's language.
 *                 example: Spanish
 *               description:
 *                 type: string
 *                 description: The scholarship's description.
 *                 example: Lorem ipsum ref ght rekjr ekrjek afda
 *               criteria:
 *                 type: string
 *                 description: The scholarship's criteria.
 *                 example: Lorem.
 *               requirements:
 *                 type: string
 *                 description: The scholarship's requirements.
 *                 example: Lorem.
 *               start:
 *                 type: string
 *                 format: date-time
 *                 description: The scholarship's program start date.
 *                 example: 2024-09-10T10:41:32.902Z.
 *               end:
 *                 type: string
 *                 format: date-time
 *                 description: The scholarship's program end date.
 *                 example: 2024-09-10T10:41:32.902Z
 *               poster:
 *                 type: string
 *                 format: binary
 *                 description: The poster image to the scholarship.
 *     responses:
 *       201:
 *         description: Scholarship created successfully.
 *       401:
 *         description: Unauthorised.
 *       404:
 *         description: University not found.
 *       400:
 *         description: Bad request, invalid file or missing fields.
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /scholarship/university:
 *   get:
 *     summary: Returns a list of the created scholarships of a university.
 *     tags:
 *       - University
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of scholarships associated with a particular university.
 *     responses:
 *       200:
 *         description: A list of scholarships with details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: The title of the scholarship.
 *                     example: Tetfund
 *                   program:
 *                     type: string
 *                     description: The program of the scholarship.
 *                     example: Information Systems, AI focused.
 *                   degree:
 *                     type: string
 *                     description: The degree of application in the scholarship.
 *                     example: Masters
 *                   language:
 *                     type: string
 *                     description: The scholarship's language.
 *                     example: Spanish
 *                   description:
 *                     type: string
 *                     description: The scholarship's description.
 *                     example: Lorem ipsum ref ght rekjr ekrjek afda
 *                   criteria:
 *                     type: string
 *                     description: The scholarship's criteria.
 *                     example: Lorem.
 *                   requirements:
 *                     type: string
 *                     description: The scholarship's requirements.
 *                     example: Lorem.
 *                   start:
 *                     type: string
 *                     format: date-time
 *                     description: The scholarship's program start date.
 *                     example: 2024-09-10T10:41:32.902Z
 *                   end:
 *                     type: string
 *                     format: date-time
 *                     description: The scholarship's program end date.
 *                     example: 2024-09-10T10:41:32.902Z
 *                   poster:
 *                     type: string
 *                     format: binary
 *                     description: The poster image for the scholarship.
 *       500:
 *         description: Internal server error.
 */

scholarshipRoute
  .route("/university")
  .post(
    upload.single("poster"),
    [
      ...[
        "title",
        "program",
        "degree",
        "language",
        "description",
        "criteria",
        "requirements",
      ].map((name) => body(name).notEmpty().withMessage(`${name} is required`)),
      ...["start", "end"].map((name) =>
        body(name)
          .custom((val, { req }) => {
            console.log(moment(val).isSameOrAfter(moment(), "day"));
            return moment(val).isSameOrAfter(moment(), "day");
          })
          .withMessage(
            `Invalid ${name} date received, date must be greater than today`
          )
      ),
    ],
    createScholarShip
  )
  .get(getScholarships);

/**
 * @swagger
 * /scholarship/university/{id}:
 *   delete:
 *     summary: Returns a list of the created scholarships of a university.
 *     tags:
 *       - University
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of scholarships associated with a particular university.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the scholarship.
 *         example: 66dedcf56c91339e212e1c31
 *     responses:
 *       404:
 *         description: University does not exist.
 *       200:
 *         description: University deleted successfully.
 */
scholarshipRoute.route("/university/:scholarshipId").delete(deleteScholarShip);
export default scholarshipRoute;
