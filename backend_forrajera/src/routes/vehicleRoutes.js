import { Router } from "express";
import { vehicleController } from "../controllers/vehicleController.js";

const router = Router();

// CRUD de vehículos
router.get("/", vehicleController.getAll);
router.get("/stats/:id", vehicleController.getStats);
router.get("/:id", vehicleController.getById);
router.post("/", vehicleController.create);
router.put("/:id", vehicleController.update);
router.delete("/:id", vehicleController.delete);

export { router as vehicleRoutes };
