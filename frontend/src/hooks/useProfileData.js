// src/hooks/useProfileData.js
//
// TEMPORARY STUB — returns mock profile data so the Profile page can be
// built and tested before backend/Firestore integration exists.
//
// When ready, replace the body with a real Firestore doc listener
// (same pattern as useDashboardData.js). Keep the return shape identical:
// { profileData, loading, updateProfile }.

import { useState, useEffect, useCallback } from "react";
import { mockProfileData } from "../data/mockProfileData";

export function useProfileData() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProfileData(mockProfileData);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Placeholder save function. Later this becomes a Firestore
  // `updateDoc(doc(db, "users", uid), updates)` call.
  const updateProfile = useCallback((updates) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
    // TODO: persist to backend once available
    return Promise.resolve();
  }, []);

  return { profileData, loading, updateProfile };
}