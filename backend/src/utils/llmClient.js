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