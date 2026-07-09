import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  { title: String, description: String, week: Number },
  { _id: false }
);

const subjectRoadmapSchema = new mongoose.Schema(
  {
    name: String,
    topics: [topicSchema],
    resourceSuggestions: [String], // search phrases only, never fabricated URLs
    notes: String,
  },
  { _id: false }
);

const timetableEntrySchema = new mongoose.Schema(
  { day: String, subject: String, duration: String, focus: String },
  { _id: false }
);

const studyRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    grade: { type: String, required: true },
    selectedSubjects: [String],
    subjects: [subjectRoadmapSchema],
    timetable: [timetableEntrySchema],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const StudyRoadmap = mongoose.model("StudyRoadmap", studyRoadmapSchema);