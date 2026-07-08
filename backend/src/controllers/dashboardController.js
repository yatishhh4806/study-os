// src/controllers/dashboardController.js
import { Subject } from "../models/Subject.js";
import { Deck } from "../models/Deck.js";
import { Flashcard } from "../models/Flashcard.js";
import { Task } from "../models/Task.js";
import { Note } from "../models/Note.js";
import { FocusSession } from "../models/FocusSession.js";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// GET /api/dashboard/summary
export async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();

    // ── subjects + a real "mature cards" proxy for mastery ──
    // "mastery %" isn't a tracked concept yet (that needs a real quiz/
    // assessment feature) — this uses the same "mature card" idea Anki
    // uses: a card that's survived 3+ successful spaced-repetition
    // reviews is meaningfully more learned than one you just added.
    // It's a genuine signal, just not literally "% subject mastered."
    const subjects = await Subject.find({ userId }).select("name emoji color");
    const decks = await Deck.find({ userId }).select("_id subjectId");
    const deckToSubject = Object.fromEntries(decks.map((d) => [d._id.toString(), d.subjectId?.toString()]));

    const cardStats = await Flashcard.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$deckId",
          total: { $sum: 1 },
          mature: { $sum: { $cond: [{ $gte: ["$repetitions", 3] }, 1, 0] } },
          due: { $sum: { $cond: [{ $lte: ["$dueDate", now] }, 1, 0] } },
        },
      },
    ]);

    const bySubject = {};
    for (const row of cardStats) {
      const subjectId = deckToSubject[row._id.toString()];
      if (!subjectId) continue;
      if (!bySubject[subjectId]) bySubject[subjectId] = { total: 0, mature: 0, due: 0 };
      bySubject[subjectId].total += row.total;
      bySubject[subjectId].mature += row.mature;
      bySubject[subjectId].due += row.due;
    }

    const subjectSummaries = subjects.map((s) => {
      const stat = bySubject[s._id.toString()] || { total: 0, mature: 0, due: 0 };
      return {
        id: s._id,
        name: s.name,
        emoji: s.emoji,
        color: s.color,
        masteryPct: stat.total ? Math.round((stat.mature / stat.total) * 100) : 0,
        dueCards: stat.due,
      };
    });

    const dueCardsTotal = subjectSummaries.reduce((sum, s) => sum + s.dueCards, 0);

    // ── today: schedule + completion percentage ──
    const todayTasks = await Task.find({
      userId,
      date: { $gte: startOfDay(), $lte: endOfDay() },
    }).sort({ startTime: 1 });

    const todayCompletionPct = todayTasks.length
      ? Math.round((todayTasks.filter((t) => t.completed).length / todayTasks.length) * 100)
      : 0;

    // ── study plan (plain checklist items — no date set) ──
    const studyPlan = await Task.find({ userId, date: null })
      .sort({ createdAt: -1 })
      .limit(6);

    // ── deadlines ──
    const deadlines = await Task.find({
      userId,
      completed: false,
      urgency: { $ne: null },
      date: { $gte: now },
    })
      .sort({ date: 1 })
      .limit(5);

    // ── heatmap: last 30 days of focus session minutes, bucketed into
    // 4 levels for the visual grid ──
    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);
    since30.setHours(0, 0, 0, 0);

    const heatmapRaw = await FocusSession.aggregate([
      { $match: { userId, completed: true, startedAt: { $gte: since30 } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          totalMinutes: { $sum: "$durationMinutes" },
        },
      },
    ]);
    const minutesByDate = Object.fromEntries(heatmapRaw.map((r) => [r._id, r.totalMinutes]));

    const heatmap = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const minutes = minutesByDate[key] || 0;
      const level = minutes === 0 ? 0 : minutes < 30 ? 1 : minutes < 90 ? 2 : 3;
      heatmap.push(level);
    }

    // ── recent activity: merge notes/reviews/focus sessions, newest first ──
    const [recentNotes, recentReviewedCards, recentSessions] = await Promise.all([
      Note.find({ userId }).sort({ updatedAt: -1 }).limit(3).select("title updatedAt"),
      Flashcard.find({ userId, lastReviewedAt: { $ne: null } })
        .sort({ lastReviewedAt: -1 })
        .limit(3)
        .select("front lastReviewedAt"),
      FocusSession.find({ userId, completed: true }).sort({ endedAt: -1 }).limit(3).select("durationMinutes endedAt"),
    ]);

    const activity = [
      ...recentNotes.map((n) => ({
        icon: "📝",
        text: `Updated "${n.title || "Untitled"}" note`,
        time: n.updatedAt,
        color: "#22d3ee",
      })),
      ...recentReviewedCards.map((c) => ({
        icon: "🧠",
        text: `Reviewed a flashcard: "${c.front.slice(0, 40)}${c.front.length > 40 ? "…" : ""}"`,
        time: c.lastReviewedAt,
        color: "#a855f7",
      })),
      ...recentSessions.map((s) => ({
        icon: "⏱",
        text: `Completed a ${s.durationMinutes}min focus session`,
        time: s.endedAt,
        color: "#34d399",
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

    res.json({
      streak: req.user.stats.currentStreak,
      bestStreak: req.user.stats.bestStreak,
      studyHours: Math.round((req.user.stats.totalStudyMinutes / 60) * 10) / 10,
      weeklyXP: req.user.stats.weeklyXP,
      dueCardsTotal,
      todayCompletionPct,
      studyPlan,
      schedule: todayTasks,
      deadlines,
      subjects: subjectSummaries,
      heatmap,
      activity,
    });
  } catch (err) {
    next(err);
  }
}