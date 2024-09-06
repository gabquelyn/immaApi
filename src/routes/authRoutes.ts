import { Router } from "express";
import {
  verifyController,
  loginController,
  logoutController,
  registerStudentController,
  forgotPasswordController,
  restPasswordController,
  registerUniversityController,
  refreshController,
} from "../controllers/authController";
import { body } from "express-validator";
import moment from "moment";
import Multer from "multer";
const upload = Multer({ dest: "/tmp" });

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Operations about authentication
 */

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Login to get access token.
 *     tags:
 *       - Authentication
 *     description: Operations about authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: "xxxxxxxxxx"
 *               type:
 *                 type: string
 *                 description: The user's account type.
 *                 enum:
 *                   - university
 *                   - student
 *                 example: university
 *     responses:
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized.
 *       400:
 *         description: Invalid account type.
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Signed Jwt for the user.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."
 */

authRouter.route("/").post(loginController);

/**
 * @swagger
 * /auth/verify/{type}/{userId}/{token}:
 *   get:
 *     summary: Verifies the user account.
 *     tags:
 *       - Authentication
 *     description: Verifies the email address of a specific user.
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The user account type.
 *         example: university
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the user.
 *         example: 64c71b8f8e4eabc123456789
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The token received from in the mail.
 *         example: 8f8e4eabc1234567898f8e4eabc64c71b8f8e4eabc
 *     responses:
 *       200:
 *         description: Email verified sucessfully.
 *       400:
 *         description: Invalid link or invalid account type
 *       404:
 *         description: User not found
 */

authRouter.route("/verify/:type/:userId/:token").get(verifyController);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log the user out.
 *     tags:
 *       - Authentication
 *     description: Deletes the refresh cookie.
 *     responses:
 *       200:
 *         description: Cookie cleared successfully.
 *       500:
 *         description: Internal server error
 *
 */

authRouter.route("/logout").post(logoutController);

/**
 * @swagger
 * /auth/forgot:
 *   post:
 *     summary: To request for a password reset.
 *     tags:
 *       - Authentication
 *     description: Operations about authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: john.doe@example.com
 *               type:
 *                 type: string
 *                 description: The user's account type.
 *                 enum:
 *                   - university
 *                   - student
 *                 example: university
 *     responses:
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *       400:
 *         description: Invalid account type.
 *       200:
 *         description: Recovery email sent successful.
 */
authRouter.route("/forgot").post(forgotPasswordController);

/**
 * @swagger
 * /auth/reset/{token}:
 *   post:
 *     summary: To request for a password reset.
 *     tags:
 *       - Authentication
 *     description: Operations about authentication.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The recovery token received in email.
 *         example: xxxxxxxxxxxxxxxxxx
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The user's new password.
 *                 example: xxxxxxxxx
 *               type:
 *                 type: string
 *                 description: The user's account type.
 *                 enum:
 *                   - university
 *                   - student
 *                 example: university
 *     responses:
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *       400:
 *         description: Invalid account type or link.
 *       200:
 *         description: Password updated successfully successful.
 */
authRouter.route("/reset/:token").post(restPasswordController);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Requests a new access token.
 *     tags:
 *       - Authentication
 *     description: Uses the cookie to request for a new access token.
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Signed Jwt for the user.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."
 *       403:
 *         description: Forbidden.
 *       400:
 *         description: Invalid account type
 *       404:
 *         description: User not found
 */
authRouter.route("/refresh").get(refreshController);

/**
 * @swagger
 * /auth/register/student:
 *   post:
 *     summary: Create a new student acccount.
 *     tags:
 *       - Authentication
 *     description: Creates a new user student account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The student's email.
 *                 example: john.doe@example.com
 *               firstname:
 *                 type: string
 *                 description: The student's firstname.
 *                 example: John
 *               lastname:
 *                 type: string
 *                 description: The student's lastname.
 *                 example: Doe
 *               nationality:
 *                 type: string
 *                 description: The student's nationality.
 *                 example: Nigeria
 *               phone:
 *                 type: string
 *                 description: The student's mobile number.
 *                 example: +234 909 9172
 *               dob:
 *                 type: string
 *                 description: The student's date of birth.
 *                 example: 2002-09-06T22:29:01.902Z
 *               password:
 *                 type: string
 *                 description: The student's password.
 *                 example: "xxxxxxxxxx"
 *     responses:
 *       409:
 *         description: Email already in use.
 *       400:
 *         description: Invalid data received.
 *       201:
 *         description: Account created successfully.
 */

authRouter.route("/register/student").post(
  [
    body("email").isEmail().withMessage("invalid email address"),
    body("password")
      .isLength({ min: 9 })
      .isAlphanumeric()
      .withMessage("Password too weak"),
    body("phone").isMobilePhone("any").withMessage("invalid mobile number"),
    body("firstname").notEmpty().withMessage("First name is required"),
    body("lastname").notEmpty().withMessage("Last name is required"),
    body("dob")
      .custom((val, { req }) =>
        moment(val).isSameOrBefore(moment().subtract(18, "years"))
      )
      .withMessage("Age must be above 18"),
    body("nationality").notEmpty().withMessage("invalid nationality"),
  ],
  registerStudentController
);

/**
 * @swagger
 * /auth/register/university:
 *   post:
 *     summary: Create a new university account.
 *     tags:
 *       - Authentication
 *     description: Create a new university with the document uploads.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the university.
 *                 example: My University
 *               province:
 *                 type: string
 *                 description: The province of the university.
 *                 example: Eh Vanchi
 *               zipcode:
 *                 type: string
 *                 description: The zipcode of the university.
 *                 example:  1102233
 *               email:
 *                 type: string
 *                 description: The university's email.
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 description: The university's official phone number.
 *                 example: +234 909 455 344
 *               password:
 *                 type: string
 *                 description: The university's password.
 *                 example: xxxxxxxxxxxxx
 *               documents:
 *                 type: string
 *                 format: binary
 *                 description: The document file to upload.
 *     responses:
 *       201:
 *         description: Account vreated successfully.
 *       400:
 *         description: Bad request, invalid file or missing fields.
 *       409:
 *         description: University mail already in use.
 */

authRouter
  .route("/register/university")
  .post(
    upload.array("documents"),
    [
      body("email").isEmail().withMessage("invalid email address"),
      body("password").isLength({ min: 9 }).withMessage("Password too weak"),
      body("phone").isMobilePhone("any").withMessage("invalid mobile number"),
      body("name").notEmpty().withMessage("University name is required"),
      body("zipcode").isPostalCode("any").withMessage("Invalid postal code"),
      body("province").notEmpty().withMessage("invalid province"),
    ],
    registerUniversityController
  );
export default authRouter;
