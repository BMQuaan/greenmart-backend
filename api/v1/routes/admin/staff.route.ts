import { Router } from "express";
import * as controller from "../../controllers/admin/staff.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router: Router = Router();

router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_staff"), controller.index);

router.get("/detail/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_staff"), controller.detail);

export const staffRoutes : Router = router;
