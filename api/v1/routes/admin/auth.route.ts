import { Router } from "express";
import * as controller from "../../controllers/admin/auth.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import multer from "multer";
import validateRequest from "../../middlewares/admin/validateRequest";
import { updateOwnProfileSchema } from "../../validations/admin/auth.validation";

const upload = multer({ storage: multer.memoryStorage() });

const router: Router = Router();

router.post("/login", controller.login);

router.get("/refresh-token", controller.refreshStaffAccessToken);

router.get("/detail", authMiddleware.authenticateStaffToken, controller.detail);

router.put("/update", authMiddleware.authenticateStaffToken, upload.single("staffAvatar"), validateRequest(updateOwnProfileSchema), controller.update);

router.post("/logout", controller.logoutStaff);


export const authRoutes : Router = router;