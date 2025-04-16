import { Router } from "express";

import * as controller from "../controllers/user.controller";
import * as authMiddleware from "../middlewares/auth.middleware";
const router: Router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/detail", authMiddleware.authenticateToken, controller.detail);
router.get("/refresh-token",controller.refreshAccessToken);

export const userRoutes : Router = router;