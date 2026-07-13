// src/controllers/aiTutorController.js
import { z } from "zod";
import { Subject } from "../models/Subject.js";
import { Deck } from "../models/Deck.js";
import { Flashcard } from "../models/Flashcard.js";
import { Task } from "../models/Task.js";
import { AppError } from "../middleware/errorHandler.js";
import { checkAiUsage } from "../utils/aiUsage.js";
import { getTutorReply } from "../utils/llmClient.js";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(40), // caps context size sent to the API each request
});

// Builds a real context summary from the user's actual data — subjects,
// due flashcards per subject, upcoming deadlines. This mirrors the shape
// buildTutorContext() constructs client-side in AiTutor.jsx, but built
// from genuine database state instead of local mock data.
async function buildTutorContext(userId) {
  const subjects = await Subject.find({ userId }).select("name");

  const decks = await Deck.find({ userId }).select("_id subjectId");
  const deckToSubject = Object.fromEntries(decks.map((d) => [d._id.toString(), d.subjectId]));

  const now = new Date();
  const dueCardsBySubject = await Flashcard.aggregate([
    { $match: { userId, dueDate: { $lte: now } } },
    { $group: { _id: "$deckId", dueCount: { $sum: 1 } } },
  ]);

  const dueBySubjectId = {};
  for (const row of dueCardsBySubject) {
    const subjectId = deckToSubject[row._id.toString()];
    if (!subjectId) continue;
    const key = subjectId.toString();
    dueBySubjectId[key] = (dueBySubjectId[key] || 0) + row.dueCount;
  }

  const subjectsSummary = subjects.map((s) => ({
    name: s.name,
    dueCards: dueBySubjectId[s._id.toString()] || 0,
  }));

  const deadlines = await Task.find({
    userId,
    completed: false,
    urgency: { $ne: null },
    date: { $gte: now },
  })
    .sort({ date: 1 })
    .limit(5)
    .select("title date urgency");

  return { subjectsSummary, deadlines };
}

function buildSystemPrompt(user, context) {
  const subjectLines = context.subjectsSummary.length
    ? context.subjectsSummary
        .map((s) => `- ${s.name}: ${s.dueCards} card${s.dueCards === 1 ? "" : "s"} due`)
        .join("\n")
    : "- No subjects created yet.";

  const deadlineLines = context.deadlines.length
    ? context.deadlines
        .map((d) => `- ${d.title} (${d.urgency} priority, due ${d.date.toDateString()})`)
        .join("\n")
    : "- No upcoming deadlines.";

  return `You are the AI Tutor inside StudyOS, a study companion app. You're helping ${user.name}, a student.

Their current subjects and flashcard review load:
${subjectLines}

Their upcoming deadlines:
${deadlineLines}

Their current study streak is ${user.stats.currentStreak} day(s).

Be encouraging, concise, and practical. When relevant, reference their actual subjects, due cards, or deadlines above rather than speaking generically. If they ask to be quizzed, generate questions based on the subject they mention. Keep responses focused — this is a chat interface, not an essay.`;
}

// POST /api/ai-tutor/chat
export async function chat(req, res, next) {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const user = req.user;
    const usage = checkAiUsage(user);

    if (!usage.allowed) {
      throw new AppError(
        user.isPro()
          ? "You've reached today's AI Tutor message limit. It resets at midnight."
          : "You've reached today's free AI Tutor limit. Upgrade to Pro for more daily messages.",
        429,
        user.isPro() ? "DAILY_LIMIT_REACHED" : "UPGRADE_REQUIRED"
      );
    }

    const context = await buildTutorContext(user._id);
    const systemPrompt = buildSystemPrompt(user, context);

    const reply = await getTutorReply(parsed.data.messages, systemPrompt);

    // commit usage AFTER a successful API call — a failed call shouldn't
    // count against the user's daily quota
    if (usage.needsReset) {
      user.aiUsage.dailyMessageCount = 1;
    } else {
      user.aiUsage.dailyMessageCount += 1;
    }
    user.aiUsage.lastResetDate = new Date();
    await user.save();

    res.json({
      reply,
      usage: {
        remaining: usage.remaining - 1,
        limit: usage.limit,
      },
    });
  } catch (err) {
    // Groq's SDK (OpenAI-compatible) throws errors with a numeric `status`
    // and an `error` object containing the provider's message — a shallower
    // shape than Anthropic's nested err.error.error.message.
    if (typeof err.status === "number" && err.error) {
      const providerMessage =
        err.error?.message || "AI Tutor is temporarily unavailable. Please try again.";
      return next(new AppError(providerMessage, 502, "AI_PROVIDER_ERROR"));
    }
    next(err);
  }
}

// GET /api/ai-tutor/usage — lets the frontend show "12/15 messages today" proactively
export async function getUsage(req, res, next) {
  try {
    const usage = checkAiUsage(req.user);
    res.json(usage);
  } catch (err) {
    next(err);
  }
}
