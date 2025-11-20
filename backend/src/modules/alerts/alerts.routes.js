import { Router } from "express";
import { AlertsController } from "./alerts.controller.js";

const router = Router();

router.get("/", AlertsController.getAll);
router.post("/configure", AlertsController.configure);

export default router;
