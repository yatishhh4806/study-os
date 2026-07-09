import { api } from "../lib/api";

export async function fetchRoadmap() {
  const { data } = await api.get("/resources/roadmap");
  return data.roadmap;
}

export async function generateRoadmap(grade, subjects) {
  const { data } = await api.post("/resources/roadmap/generate", { grade, subjects });
  return data.roadmap;
}

export async function searchResources(query, subject) {
  const { data } = await api.get("/resources/search", { params: { query, subject } });
  return data; // { videos: [...], notes: [...] }
}