import { Router } from "express";
import * as controller from "../../v1/controllers/product.controller";

const router: Router = Router();

// GET /api/v1/cproducts/
router.get("/", controller.index);

// GET /api/v1/products/:slugCategory
router.get("/:slugCategory", controller.category);

// GET /api/v1/products/detail/:slugProduct
router.get("/detail/:slugProduct", controller.detail);

export const productRoutes : Router = router;
