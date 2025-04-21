import { Router } from "express";
import * as controller from "../../controllers/admin/staff.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router: Router = Router();

router.post("/login", controller.login);

router.get("/refresh-token", controller.refreshStaffAccessToken);

router.get("/detail", authMiddleware.authenticateStaffToken, controller.detail);

router.put("/update", authMiddleware.authenticateStaffToken, upload.single("staffAvatar"), controller.update);

router.post("/logout", controller.logoutStaff);


export const staffRoutes : Router = router;