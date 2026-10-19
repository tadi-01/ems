import express from "express";
import Settings from "../models/Settings.js";
import { protectRoute, allowRoles } from "../middleware/authMiddleware.js";
import transaction from "../utils/transaction.js";
import { audit } from "../utils/workflowEvents.js";
import { plannedDates } from "../utils/payrollSchedule.js";
const router = express.Router();
router.use(protectRoute, allowRoles("Admin"));
// Returns defaults without silently enabling scheduled database writes.
router.get("/", async (request, response) => {
  try {
    const settings = await Settings.findById("company") || new Settings();
    response.json({ settings, dates: plannedDates(settings), timeZone: process.env.COMPANY_TIME_ZONE || "Africa/Harare" });
  } catch (error) { response.status(400).json({ message: error.message }); }
});
// Persists only explicitly supported settings and records the Admin justification.
router.put("/", async (request, response) => {
  try {
    const { reason } = request.body;
    if (!reason?.trim()) throw new Error("Enter a justification.");
    const saved = await transaction(async (session) => {
      const settings = await Settings.findById("company").session(session) || new Settings();
      const before = settings.toObject();
      for (const key of ["preparationDay", "approvalDay", "paymentRule", "paymentDay", "holidays", "automaticPreparation"]) if (request.body[key] !== undefined) settings[key] = request.body[key];
      if (!Number.isInteger(settings.preparationDay) || !Number.isInteger(settings.approvalDay) || !Number.isInteger(settings.paymentDay) || settings.approvalDay < settings.preparationDay) throw new Error("Use whole days 1–28; approval must follow preparation.");
      if (settings.holidays.some((day) => !/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day)) throw new Error("Use valid YYYY-MM-DD holidays.");
      const dates = plannedDates(settings);
      if (dates.plannedPayment < dates.approvalDue) throw new Error("Planned payment must not precede the approval deadline.");
      settings.updatedBy = request.user.userId; await settings.save({ session });
      await audit(session, request.user.userId, "settings.update", "Settings", "company", before, settings.toObject(), reason);
      return settings;
    });
    response.json({ settings: saved, dates: plannedDates(saved) });
  } catch (error) { response.status(400).json({ message: error.message }); }
});
export default router;
