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
} from "../controllers/spotifyController.js";

const router = Router();

router.get("/login", requireAuth, login);

router.get("/callback", callback);

router.get("/me", requireAuth, getProfile);

router.get("/playlists", requireAuth, getPlaylists);

router.get("/playlists/:id", requireAuth, getPlaylist);

router.get("/search", requireAuth, search);

router.delete("/disconnect", requireAuth, disconnect);

export default router;
