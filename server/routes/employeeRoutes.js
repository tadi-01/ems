import express from "express";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from "../controllers/employeeController.js";
import { allowRoles, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getAllEmployees);
router.post("/", allowRoles("Admin", "HR"), createEmployee);
router.put("/:id", allowRoles("Admin", "HR"), updateEmployee);
router.delete("/:id", allowRoles("Admin", "HR"), deleteEmployee);

export default router;
