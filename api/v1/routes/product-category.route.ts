import { Router } from "express";
import * as controller from "../../v1/controllers/product-category.controller";

const router: Router = Router();

// GET /api/v1/products-category/
router.get("/", controller.index);

// GET /api/v1/products-category/categorytree
router.get("/categorytree", controller.categoryTrees);

// GET /api/v1/products-category/categorytree/:slugCategory
router.get("/categorytree/:slugCategory", controller.categoryTree);

export const productcategoryRoutes : Router = router;
