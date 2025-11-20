import { Router } from "express";
import { TestsController } from "./tests.controller.js";

const router = Router();

router.post("/create", TestsController.create);
router.get("/", TestsController.getAll);
router.get("/:id", TestsController.getById);
router.put("/:id", TestsController.update);
router.delete("/:id", TestsController.remove);
router.post("/:id/run", TestsController.run);

export default router;
