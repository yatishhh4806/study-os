// src/utils/sm2.js

/**
 * SM-2 spaced repetition algorithm (the same one Anki is based on).
 * Kept as a pure function — no DB access — so it's easy to unit test
 * and easy to reason about independent of how it's persisted.
 *
 * @param {object} card - current scheduling state
 * @param {number} card.easeFactor - starts at 2.5, adjusts based on performance
 * @param {number} card.interval - days until next review
 * @param {number} card.repetitions - consecutive successful reviews
 * @param {number} quality - 0-5 rating of how well the card was recalled
 *   0-2 = failed/forgot (resets progress), 3-5 = passed (grows interval)
 * @returns {{ easeFactor: number, interval: number, repetitions: number, dueDate: Date }}
 */
export function scheduleNextReview({ easeFactor, interval, repetitions }, quality) {
  if (quality < 0 || quality > 5 || !Number.isInteger(quality)) {
    throw new Error("quality must be an integer between 0 and 5");
  }

  let nextEase = easeFactor;
  let nextInterval;
  let nextRepetitions;

  if (quality < 3) {
    // failed recall — restart the interval ladder, but don't touch ease
    // as harshly as older SM-2 variants do, to avoid punishing one slip
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    nextRepetitions = repetitions + 1;

    if (nextRepetitions === 1) nextInterval = 1;
    else if (nextRepetitions === 2) nextInterval = 6;
    else nextInterval = Math.round(interval * nextEase);

    // ease adjusts based on how easy/hard this recall was
    nextEase = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (nextEase < 1.3) nextEase = 1.3; // floor — never gets punishingly frequent forever
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + nextInterval);

  return {
    easeFactor: Number(nextEase.toFixed(2)),
    interval: nextInterval,
    repetitions: nextRepetitions,
    dueDate,
  };
}