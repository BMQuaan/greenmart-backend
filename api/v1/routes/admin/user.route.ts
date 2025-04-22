import { Router } from "express";
import * as controller from "../../controllers/admin/user.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router: Router = Router();

router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_user"), controller.index);

router.get("/detail/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_user"), controller.detail);

export const userRoutes : Router = router;
