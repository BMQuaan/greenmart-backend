import { Router } from "express";
import * as controller from "../../controllers/client/user.controller";
import * as authMiddleware from "../../middlewares/client/auth.middleware";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });


const router: Router = Router();

router.post("/register", controller.register);

router.post("/login", controller.login);

router.post("/logout", controller.logout);

router.get("/detail", authMiddleware.authenticateToken, controller.detail);

router.get("/refresh-token", controller.refreshAccessToken);

router.put("/update", authMiddleware.authenticateToken, upload.single("userAvatar"), controller.update);

router.post("/password/forgot", controller.requestPasswordReset);

router.post("/password/otp", controller.verifyOTP);

router.post("/password/reset", authMiddleware.authenticateToken, controller.resetPasswordAfterOTP);

export const userRoutes : Router = router;