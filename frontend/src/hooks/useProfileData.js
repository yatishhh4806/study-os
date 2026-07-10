// src/hooks/useProfileData.js
import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

function mapUserToProfileData(user, subjectsCount) {
  return {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    phone: user.phone || "",
    dob: user.dob ? new Date(user.dob).toISOString().slice(0, 10) : "",
    location: user.location || "",
    bio: user.bio || "",
    academic: {
      university: user.academicProfile?.institutionName || "",
      course: user.academicProfile?.course || "",
      year: user.academicProfile?.year || "",
      semester: user.academicProfile?.semester || "",
      enrollmentNo: user.academicProfile?.enrollmentNo || "",
      expectedGraduation: user.academicProfile?.expectedGraduation || "",
    },
    stats: {
      joinedOn: user.createdAt,
      streak: user.stats?.currentStreak ?? 0,
      studyHours: Math.round(((user.stats?.totalStudyMinutes ?? 0) / 60) * 10) / 10,
      weeklyXP: user.stats?.weeklyXP ?? 0,
      subjectsTracked: subjectsCount,
    },
  };
}

export function useProfileData() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [meRes, subjectsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/subjects"),
      ]);
      setProfileData(mapUserToProfileData(meRes.data.user, subjectsRes.data.subjects.length));
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // draft comes in shaped exactly like profileData (see Profile.jsx) —
  // flatten it back into the PATCH /auth/profile payload the backend expects
  async function updateProfile(draft) {
    const payload = {
      name: draft.name,
      phone: draft.phone || null,
      dob: draft.dob || null,
      location: draft.location || null,
      bio: draft.bio,
      institutionName: draft.academic?.university,
      course: draft.academic?.course,
      year: draft.academic?.year,
      semester: draft.academic?.semester,
      enrollmentNo: draft.academic?.enrollmentNo,
      expectedGraduation: draft.academic?.expectedGraduation,
    };

    const { data } = await api.patch("/auth/profile", payload);
    // subjectsTracked isn't part of the profile PATCH response — carry
    // the existing count forward rather than losing it on save
    setProfileData(mapUserToProfileData(data.user, profileData?.stats?.subjectsTracked ?? 0));
  }

  return { profileData, loading, updateProfile };
}
