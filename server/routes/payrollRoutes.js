import Settings from "../models/Settings.js";
import { plannedDates } from "../utils/payrollSchedule.js";
import { decidePayroll } from "../controllers/payrollApprovalController.js";
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
// Makes the payroll timetable visible to its preparers as well as Admin.
router.get("/schedule", allowRoles("Admin", "HR"), async (request, response) => {
  try { const settings = await Settings.findById("company") || new Settings(); response.json({ ...plannedDates(settings), automaticPreparation: settings.automaticPreparation }); }
  catch (error) { response.status(400).json({ message: error.message }); }
});
router.get("/me", getMyPayslips);
router.get("/", allowRoles("Admin", "HR"), getAllPayslips);
router.post("/", allowRoles("Admin", "HR"), createPayslip);
router.put("/:id/decision", allowRoles("Admin"), decidePayroll);
router.put("/:id", allowRoles("Admin", "HR"), updatePayslip);
router.delete("/:id", allowRoles("Admin", "HR"), deletePayslip);

export default router;
