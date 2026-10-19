import AuditEvent from "../models/AuditEvent.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Writes an event in the same transaction as the sensitive mutation.
async function audit(session, actor, action, entity, entityId, before, after, reason = "") {
  await AuditEvent.create([{ actor, action, entity, entityId: String(entityId), before, after, reason }], { session });
}

// Notifies Admin finance decision-makers, HR and the assigned manager once each.
async function notifyManagers(session, department, message, path) {
  const users = await User.find({ $or: [{ role: { $in: ["Admin", "HR"] } }, { _id: department?.manager }] }).session(session);
  if (users.length) await Notification.insertMany(users.map((user) => ({ recipient: user._id, message, path })), { session });
}
export { audit, notifyManagers };
