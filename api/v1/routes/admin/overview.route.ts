import { Router } from "express";
import * as controller from "../../controllers/admin/overview.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router: Router = Router();

router.get("/category", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_overview"), controller.getCategoryProductCount);


export const overViewRoutes : Router = router;
