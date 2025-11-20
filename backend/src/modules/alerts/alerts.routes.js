import { Router } from "express";
import { AlertsController } from "./alerts.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

// All alert routes require authentication
router.use(authMiddleware);

router.get("/", AlertsController.getAll);
router.post("/configure", AlertsController.configure);

export default router;
