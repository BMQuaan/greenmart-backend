import { Router } from "express";
import * as controller from "../../controllers/admin/order.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticateStaffToken,
  authMiddleware.authorizePermission("view_order"),
  controller.index
);

router.get(
  "/:id",
  authMiddleware.authenticateStaffToken,
  authMiddleware.authorizePermission("view_order"),
  controller.getOrderById
);

router.put(
  "/status/:id",
  authMiddleware.authenticateStaffToken,
  authMiddleware.authorizePermission("edit_order"),
  controller.updateOrderStatus
);

export const orderRoutes : Router = router;
