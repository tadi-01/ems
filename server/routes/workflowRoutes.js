import express from "express";
import Notification from "../models/Notification.js";
import { protectRoute } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protectRoute);
// Returns a recipient's recent notifications and the full unread count.
router.get("/notifications", async (request, response) => {
  try {
    const filter = { recipient: request.user.userId };
    const items = await Notification.find(filter).sort({ createdAt: -1 }).limit(30);
    const unread = await Notification.countDocuments({ ...filter, readAt: null });
    response.json({ items, unread });
  } catch { response.status(500).json({ message: "Could not load notifications." }); }
});
// Clears the signed-in account's unread backlog, including older paged notifications.
router.put("/notifications/read-all", async (request, response) => {
  try { await Notification.updateMany({ recipient: request.user.userId, readAt: null }, { readAt: new Date() }); response.json({ message: "Notifications marked read." }); }
  catch { response.status(400).json({ message: "Could not mark notifications read." }); }
});
// Marks only the requesting account's notification as read.
router.put("/notifications/:id/read", async (request, response) => {
  try {
    const item = await Notification.findOneAndUpdate({ _id: request.params.id, recipient: request.user.userId }, { readAt: new Date() }, { new: true });
    if (!item) return response.status(404).json({ message: "Notification not found." });
    response.json(item);
  } catch { response.status(400).json({ message: "Could not update notification." }); }
});
export default router;
