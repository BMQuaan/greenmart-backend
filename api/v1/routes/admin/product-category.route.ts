import { Router } from "express";
import * as controller from "../../controllers/admin/product-category.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router: Router = Router();

// GET /products-category/
router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_category"), controller.index);

// GET /products-category/categorytree
router.get("/categorytree", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_category"), controller.categoryTrees);


export const productcategoryRoutes : Router = router;
