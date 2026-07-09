import axios from "axios";
import { env } from "../config/env.js";

const SEARCH_URL = "https://www.googleapis.com/customsearch/v1";

export async function searchWeb(query, maxResults = 5) {
  try {
    const { data } = await axios.get(SEARCH_URL, {
      params: {
        key: env.GOOGLE_SEARCH_API_KEY,
        cx: env.GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: maxResults,
      },
      timeout: 8000,
    });

    return (data.items || []).map((item) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: item.displayLink,
    }));
  } catch (err) {
    console.error("Web search failed:", err.response?.data || err.message);
    return [];
  }
}