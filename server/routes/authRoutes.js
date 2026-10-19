import express from "express";
import rateLimit from "express-rate-limit";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Brute-force protection: 10 attempts per IP per 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.get("/me", protectRoute, getCurrentUser);

export default router;
