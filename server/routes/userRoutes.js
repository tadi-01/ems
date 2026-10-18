import express from "express";
import { getAllUsers, updateUserRole } from "../controllers/userController.js";
import { allowRoles, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protectRoute);
router.get("/", allowRoles("Admin", "HR"), getAllUsers);
router.put("/:id/role", allowRoles("Admin"), updateUserRole);

export default router;
