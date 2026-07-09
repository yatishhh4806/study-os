import axios from "axios";
import { env } from "../config/env.js";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function searchYouTube(query, maxResults = 4) {
  try {
    const { data } = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        key: env.YOUTUBE_API_KEY,
        q: query,
        part: "snippet",
        type: "video,playlist",
        maxResults,
        relevanceLanguage: "en",
        safeSearch: "strict",
      },
      timeout: 8000,
    });

    return data.items.map((item) => {
      const isPlaylist = item.id.kind === "youtube#playlist";
      const id = isPlaylist ? item.id.playlistId : item.id.videoId;
      return {
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || null,
        url: isPlaylist
          ? `https://www.youtube.com/playlist?list=${id}`
          : `https://www.youtube.com/watch?v=${id}`,
        type: isPlaylist ? "playlist" : "video",
      };
    });
  } catch (err) {
    console.error("YouTube search failed:", err.response?.data || err.message);
    return []; // fail soft — one broken search shouldn't 500 the whole page
  }
}