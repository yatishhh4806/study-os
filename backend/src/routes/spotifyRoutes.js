import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  login,
  callback,
  getProfile,
  getPlaylists,
  getPlaylist,
  search,
  disconnect,
  getPlayer,
  play,
  pause,
  nextTrack,
  previousTrack,
  transferPlayback,
  seekTrack,
  setVolume,
  getAccessToken,
} from "../controllers/spotifyController.js";

const router = Router();

router.get("/login", requireAuth, login);

router.get("/callback", callback);

router.get("/me", requireAuth, getProfile);

router.get("/playlists", requireAuth, getPlaylists);

router.get("/playlists/:id", requireAuth, getPlaylist);

router.get("/search", requireAuth, search);

router.get("/player", requireAuth, getPlayer);

router.put("/player/play", requireAuth, play);

router.put("/player/pause", requireAuth, pause);

router.post("/player/next", requireAuth, nextTrack);

router.post("/player/previous", requireAuth, previousTrack);

router.put("/player/transfer", requireAuth, transferPlayback);

router.put("/player/seek", requireAuth, seekTrack);

router.put("/player/volume", requireAuth, setVolume);

router.delete("/disconnect", requireAuth, disconnect);

router.get("/token", requireAuth, getAccessToken);


export default router;
