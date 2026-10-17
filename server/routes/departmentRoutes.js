import express from "express";
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  updateDepartment,
} from "../controllers/departmentController.js";
import { allowRoles, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getAllDepartments);
router.post("/", allowRoles("Admin", "HR"), createDepartment);
router.put("/:id", allowRoles("Admin", "HR"), updateDepartment);
router.delete("/:id", allowRoles("Admin", "HR"), deleteDepartment);

export default router;
