import { Router } from "express";
import {
  verifyController,
  loginController,
  logoutController,
  registerStudentController,
  forgotPasswordController,
  restPasswordController,
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

authRouter.route("/").post(loginController);
authRouter.route("/verify").post(verifyController);
authRouter.route("/logout").post(logoutController);
authRouter.route("/forgot").post(forgotPasswordController);
authRouter.route("/reset").post(restPasswordController);
authRouter.route("/refresh").get(refreshController);

authRouter.route("/register/student").post(
  [
    body("email").isEmail().withMessage("invalid email address"),
    body("password")
      .isLength({ min: 9 })
      .isAlphanumeric()
      .withMessage("Password too weak"),
    body("phone").isMobilePhone("any").withMessage("invalid mobile number"),
    body("firstname").notEmpty().withMessage("First name is required"),
    body("lastname").notEmpty().withMessage("First name is required"),
    body("dob")
      .custom((val, { req }) =>
        moment(val).isSameOrBefore(moment().subtract(18, "years"))
      )
      .withMessage("Age must be above 18"),
    body("nationality").notEmpty().withMessage("invalid nationality"),
  ],
  registerStudentController
);

authRouter
  .route("/register/university")
  .post(
    upload.array("documents"),
    [
      body("email").isEmail().withMessage("invalid email address"),
      body("password")
        .isLength({ min: 9 })
        .isAlphanumeric()
        .withMessage("Password too weak"),
      body("phone").isMobilePhone("any").withMessage("invalid mobile number"),
      body("name").notEmpty().withMessage("University name is required"),
      body("zipcode").isPostalCode("any").withMessage("Invalid postal code"),
      body("province").notEmpty().withMessage("invalid province"),
    ],
    registerStudentController
  );
export default authRouter;
