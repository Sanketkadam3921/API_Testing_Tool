import { Router } from "express";
import { TestsController } from "./tests.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

// All test routes require authentication
router.use(authMiddleware);

router.post("/create", TestsController.create);
router.get("/", TestsController.getAll);
router.get("/:id", TestsController.getById);
router.put("/:id", TestsController.update);
router.delete("/:id", TestsController.remove);
router.post("/:id/run", TestsController.run);

export default router;
