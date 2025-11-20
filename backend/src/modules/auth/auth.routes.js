import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

// Auth routes (public)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected route - requires authentication
router.get("/profile", authMiddleware, AuthController.profile);

export default router;
