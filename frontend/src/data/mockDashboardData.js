// src/data/mockDashboardData.js
// Temporary stand-in for real Firestore data. Shaped exactly like what
// useDashboardData() will eventually return, so swapping in the real
// hook later requires no changes to AiTutor.jsx.

export const mockDashboardData = {
  streak: 18,
  studyHours: 24.5,
  productivity: 87,
  subjects: [
    { name: "Data Structures", mastery: 78, dueCards: 5 },
    { name: "Machine Learning", mastery: 54, dueCards: 12 },
    { name: "DBMS", mastery: 91, dueCards: 2 },
    { name: "Computer Networks", mastery: 42, dueCards: 9 },
  ],
  deadlines: [
    { title: "SEPM Assignment", dueIn: "Tomorrow" },
    { title: "ML Project", dueIn: "3 Days" },
    { title: "React Project", dueIn: "5 Days" },
  ],
  schedule: [
    { time: "10:00", title: "DSA Study Block", done: true },
    { time: "12:00", title: "DBMS Revision", done: true },
    { time: "15:00", title: "ML Flashcards Review", done: false },
    { time: "18:00", title: "React Project Work", done: false },
    { time: "21:00", title: "Evening Focus Session", done: false },
  ],
};