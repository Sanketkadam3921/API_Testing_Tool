import { Router } from "express";
import { MonitorsController } from "./monitors.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

// All monitor routes require authentication
router.use(authMiddleware);

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
