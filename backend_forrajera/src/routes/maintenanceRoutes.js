import { Router } from "express";
import { maintenanceController } from "../controllers/maintenanceController.js";

const router = Router();

// CRUD de registros de mantenimiento
router.get("/", maintenanceController.getAll);
router.get("/upcoming", maintenanceController.getUpcomingServices);
router.get("/summary", maintenanceController.getMaintenanceSummary);
router.get("/by-vehicle/:vehicleId", maintenanceController.getHistoryByVehicle);
router.get("/:id", maintenanceController.getById);
router.post("/", maintenanceController.create);
router.put("/:id", maintenanceController.update);
router.delete("/:id", maintenanceController.delete);

export { router as maintenanceRoutes };
