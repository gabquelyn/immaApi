import express, { Express } from "express";
import logger, { logEvents } from "./middlewares/logger";
import cookierParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler";
import dotenv from "dotenv";
import connectDB from "./utils/connectDB";
import mongoose from "mongoose";
import path from "path";
import authRouter from "./routes/authRoutes";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import scholarshipRoute from "./routes/scholarshipRoutes";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "immaApi",
    version: "1.0.0",
    description: "Api endpoints for the imma",
  },
  servers: [
    {
      url: "https://immaapi.onrender.com/",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "Operations about authentication",
    },
    {
      name: "University",
      description: "Operations about universities",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

dotenv.config();
connectDB();
const app: Express = express();
const port = process.env.PORT || 8080;

app.use(logger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(cookierParser());

app.use("/auth", authRouter);
app.use("/scholarship", scholarshipRoute);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);
mongoose.connection.on("open", () => {
  console.log("Connected to DB");
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErr.log"
  );
});
