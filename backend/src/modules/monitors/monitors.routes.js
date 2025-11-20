import { Router } from "express";
import { MonitorsController } from "./monitors.controller.js";

const router = Router();

// Monitor CRUD operations
router.post("/", MonitorsController.create);
router.get("/", MonitorsController.getAll);
router.get("/stats", MonitorsController.getStats);
router.get("/:id", MonitorsController.getById);
router.put("/:id/status", MonitorsController.updateStatus);
router.delete("/:id", MonitorsController.delete);

// Monitor testing
router.post("/:id/test", MonitorsController.runTest);

export default router;
