import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

import {
  login,
  callback,
  getProfile,
  getPlaylists,
  selectPlaylist,
  search,
  disconnect,
  getAccessToken,
  getPlayer,
  getAvailableDevices,
  play,
  pause,
  nextTrack,
  previousTrack,
  transferPlayback,
  seekTrack,
  setVolume,
} from "../controllers/spotifyController.js";

const router = Router();

router.get("/login", requireAuth, login);

router.get("/callback", callback);

router.get("/me", requireAuth, getProfile);

router.get("/playlists", requireAuth, getPlaylists);

router.get(
  "/playlists/:id",
  requireAuth,
  selectPlaylist
);

router.get("/search", requireAuth, search);

router.get("/player", requireAuth, getPlayer);

router.get("/token", requireAuth, getAccessToken);

router.put("/player/play", requireAuth, play);

router.put("/player/pause", requireAuth, pause);

router.post("/player/next", requireAuth, nextTrack);

router.get("/player", requireAuth, getPlayer);

router.post(
  "/player/previous",
  requireAuth,
  previousTrack
);

router.put(
  "/player/transfer",
  requireAuth,
  transferPlayback
);

router.put(
  "/player/seek",
  requireAuth,
  seekTrack
);

router.put(
  "/player/volume",
  requireAuth,
  setVolume
);

router.delete(
  "/disconnect",
  requireAuth,
  disconnect
);

router.get(
  "/devices",
  requireAuth,
  getAvailableDevices
);
export default router;