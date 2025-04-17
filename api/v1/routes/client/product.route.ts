import { Router } from "express";
import * as controller from "../../controllers/client/product.controller";

const router: Router = Router();

// GET /api/v1/cproducts/
router.get("/", controller.index);

// GET /api/v1/products/:slugCategory
router.get("/:slugCategory", controller.category);

// GET /api/v1/products/detail/:slugProduct
router.get("/detail/:slugProduct", controller.detail);

export const productRoutes : Router = router;
