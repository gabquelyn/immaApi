import mongoose from "mongoose";
import university from "./university";
const scholarshipSchema = new mongoose.Schema({
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  program: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  criteria: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Scholarship", scholarshipSchema);
