import { Router } from "express";
import * as controller from "../../controllers/admin/product.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router: Router = Router();

router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_product"), controller.index);

router.get("/detail/:slugProduct", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_product"), controller.detail);

export const productRoutes : Router = router;
