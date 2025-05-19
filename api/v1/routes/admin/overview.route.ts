import { Router } from "express";
import * as controller from "../../controllers/admin/overview.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router: Router = Router();

router.get("/category", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_overview"), controller.getCategoryProductCount);

router.get("/total", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_overview"), controller.getTotalCounts);

router.get("/statistics", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_overview"), controller.getOrderStatistics);

router.get("/order-today", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_overview"), controller.getTodayOrders);


export const overViewRoutes : Router = router;
