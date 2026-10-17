import express from "express";
import {
  createPayslip,
  deletePayslip,
  getAllPayslips,
  getMyPayslips,
  updatePayslip,
} from "../controllers/payrollController.js";
import { allowRoles, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/me", getMyPayslips);
router.get("/", allowRoles("Admin", "HR"), getAllPayslips);
router.post("/", allowRoles("Admin", "HR"), createPayslip);
router.put("/:id", allowRoles("Admin", "HR"), updatePayslip);
router.delete("/:id", allowRoles("Admin", "HR"), deletePayslip);

export default router;
