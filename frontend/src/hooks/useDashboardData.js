// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/dashboard/summary");
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
      setError(err.response?.data?.error || "Couldn't load your dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { dashboardData, loading, error, refresh: load };
}