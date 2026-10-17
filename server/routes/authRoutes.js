import express from "express";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectRoute, getCurrentUser);

export default router;
