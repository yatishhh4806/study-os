import { z } from "zod";
import { StudyRoadmap } from "../models/StudyRoadmap.js";
import { AppError } from "../middleware/errorHandler.js";
import { getTutorReply } from "../utils/llmClient.js";

const generateSchema = z.object({
  grade: z.string().min(1),
  subjects: z.array(z.string().min(1)).min(1).max(10),
});

function buildRoadmapPrompt(grade, subjects) {
  return `Generate a study roadmap for a student in "${grade}" studying: ${subjects.join(", ")}.

Respond with ONLY valid JSON, no markdown, no commentary, exactly this shape:
{
  "subjects": [
    {
      "name": "string",
      "topics": [{ "title": "string", "description": "one sentence", "week": number }],
      "resourceSuggestions": ["short search phrase, e.g. 'NCERT Physics Ch.4 notes' — NEVER a fabricated URL"],
      "notes": "2-3 sentence study tip for this subject"
    }
  ],
  "timetable": [
    { "day": "Monday", "subject": "string", "duration": "e.g. 1.5 hours", "focus": "string" }
  ]
}

Rules:
- 4-8 topics per subject, spread across weeks 1-8.
- Never invent specific URLs or claim a website exists — give short search phrases only.
- Timetable should realistically balance ${subjects.length} subjects across a week, including rest/revision slots.
- Output must be strictly valid, parseable JSON only — no trailing commas, no comments.`;
}

// POST /api/resources/roadmap/generate  { grade, subjects }
export async function generateRoadmap(req, res, next) {
  try {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const { grade, subjects } = parsed.data;

    const raw = await getTutorReply(
      [{ role: "user", content: buildRoadmapPrompt(grade, subjects) }],
      "You generate structured study roadmaps. Respond with strictly valid JSON only, matching the requested shape exactly — no markdown, no extra text before or after the JSON."
    );

    let parsedRoadmap;
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsedRoadmap = JSON.parse(cleaned);
    } catch {
      throw new AppError(
        "The AI Tutor returned an unexpected format. Please try regenerating.",
        502,
        "AI_PARSE_ERROR"
      );
    }

    const roadmap = await StudyRoadmap.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        grade,
        selectedSubjects: subjects,
        subjects: parsedRoadmap.subjects || [],
        timetable: parsedRoadmap.timetable || [],
        generatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ roadmap });
  } catch (err) {
    if (typeof err.status === "number" && err.error) {
      const providerMessage =
        err.error?.message || "AI Tutor is temporarily unavailable. Please try again.";
      return next(new AppError(providerMessage, 502, "AI_PROVIDER_ERROR"));
    }
    next(err);
  }
}

// GET /api/resources/roadmap
export async function getRoadmap(req, res, next) {
  try {
    const roadmap = await StudyRoadmap.findOne({ userId: req.user._id });
    res.json({ roadmap: roadmap || null });
  } catch (err) {
    next(err);
  }
}