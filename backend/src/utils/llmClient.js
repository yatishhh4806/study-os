// src/utils/llmClient.js
import Groq from "groq-sdk";
import { env } from "../config/env.js";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

/**
 * @param {Array<{role: "user"|"assistant", content: string}>} messages
 * @param {string} systemPrompt
 * @returns {Promise<string>} the assistant's reply text
 */
export async function getTutorReply(messages, systemPrompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // free tier, strong quality/speed tradeoff
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}

/**
 * Generates flashcard question/answer pairs from raw text (pasted notes,
 * extracted PDF text, or a video transcript). Returns a plain array,
 * empty if the model's output couldn't be parsed as JSON — the caller
 * decides how to surface that as an error.
 */
export async function generateFlashcards(text, count, subjectName) {
  const prompt = `You are a study assistant. Generate exactly ${count} high-quality spaced-repetition flashcards from the following content about "${subjectName}".

CONTENT:
${text.slice(0, 3000)}

Rules:
- Questions should test understanding, not just recall
- Answers should be concise (1-3 sentences)
- Cover different concepts
- Return ONLY a JSON array, no markdown, no explanation

Format:
[{"question":"...","answer":"..."},...]`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2048,
    temperature: 0.4,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "";
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}