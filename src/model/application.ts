import mongoose from "mongoose";
const applicationSchema = new mongoose.Schema({
  scholarship: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Scholarship",
  },
  student: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Student",
  },
  education: [
    {
      school: {
        type: String,
        required: true,
      },
      course: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      status: {
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
    },
  ],
  documents: [{ type: String, required: true }],
});

export default mongoose.model("Application", applicationSchema);
