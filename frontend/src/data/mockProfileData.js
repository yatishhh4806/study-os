// src/data/mockProfileData.js
// Temporary stand-in for real user profile data (Firestore /users/{uid}).
// Shaped so swapping in the real hook later requires no changes downstream.

export const mockProfileData = {
  name: "Yatish Taneja",
  email: "yatish.taneja@example.com",
  phone: "+91 98765 43210",
  dob: "2003-08-14",
  location: "Jaipur, Rajasthan",
  bio: "AIML student building StudyOS in my spare time. Always down to talk MERN stack or Codenames strategy.",
  avatarUrl: "", // empty = fall back to initials

  academic: {
    university: "Manipal University Jaipur",
    course: "B.Tech Computer Science Engineering (AI & ML)",
    year: "3rd Year",
    semester: "6th Semester",
    enrollmentNo: "MUJ21CS1042",
    expectedGraduation: "2027",
  },

  stats: {
    streak: 18,
    studyHours: 24.5,
    productivity: 87,
    subjectsTracked: 4,
    joinedOn: "2025-01-12",
  },
};