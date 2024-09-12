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
applicationRoutes
  .route("/:schorlarshipId")
  .post(upload.array("documents"), createApplication)
  .get(getScholarshipApplications);
applicationRoutes.route("/").get(getApplications);
export default applicationRoutes;
