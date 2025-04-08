import { Router } from "express";
import * as controller from "../../v1/controllers/product-category.controller";

const router: Router = Router();

// GET /api/v1/products-category/
router.get("/", controller.index);

export const productcategoryRoutes : Router = router;
