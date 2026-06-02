import { Router } from "express";
import { fuelController } from "../controllers/fuelController.js";

const router = Router();

// CRUD de registros de combustible
router.get("/", fuelController.getAll);
router.get("/expenses/by-period", fuelController.getExpensesByPeriod);
router.get("/expenses/by-vehicle", fuelController.getExpensesByVehicle);
router.get("/:id", fuelController.getById);
router.post("/", fuelController.create);
router.put("/:id", fuelController.update);
router.delete("/:id", fuelController.delete);

export { router as fuelRoutes };
