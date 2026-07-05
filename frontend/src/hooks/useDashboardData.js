// src/hooks/useDashboardData.js
//
// TEMPORARY STUB — returns mock data so pages can be built and tested
// before Firebase/backend integration exists.
//
// When your real dashboard data source is ready, replace the body of
// this hook with your actual Firestore query. Keep the return shape
// identical ({ dashboardData, loading }) so AiTutor.jsx and any other
// consumer needs zero changes.

import { useState, useEffect } from "react";
import { mockDashboardData } from "../data/mockDashboardData";

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulates a network/Firestore fetch delay so loading states
    // are actually visible and testable in the UI.
    const timer = setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return { dashboardData, loading };
}