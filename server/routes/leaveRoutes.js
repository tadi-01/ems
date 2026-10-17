import express from "express";
import {
  applyForLeave,
  cancelLeave,
  getMyLeaves,
} from "../controllers/leaveController.js";
import {
  approveLeave,
  getAllLeaves,
  getLeaveBalances,
  rejectLeave,
} from "../controllers/leaveReviewController.js";
import { allowRoles, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.post("/", applyForLeave);
router.get("/me", getMyLeaves);
router.put("/:id/cancel", cancelLeave);
router.get("/balances", allowRoles("Admin", "HR"), getLeaveBalances);
router.get("/", allowRoles("Admin", "HR"), getAllLeaves);
router.put("/:id/approve", allowRoles("Admin", "HR"), approveLeave);
router.put("/:id/reject", allowRoles("Admin", "HR"), rejectLeave);

export default router;
