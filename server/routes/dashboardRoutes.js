import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";
import { allowRoles, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", allowRoles("Admin", "HR"), getDashboardSummary);

export default router;
