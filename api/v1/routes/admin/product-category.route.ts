import { Router } from "express";
import * as controller from "../../controllers/admin/product-category.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import upload from "../../middlewares/admin/upload.middleware";
import validateRequest from "../../middlewares/admin/validateRequest";
import { addProductCategorySchema, deleteProductCategorySchema, updateProductCategorySchema } from "../../validations/admin/product-category.validation";


const router: Router = Router();

// GET /products-category/
router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_category"), controller.index);

// GET /products-category/detail/:slug
router.get("/detail/:slug", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_category"), controller.detail);

// GET /products-category/categorytree
router.get("/categorytree", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_category"), controller.categoryTrees);

router.post("/add", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("add_category"), upload.single("categoryImage"), validateRequest(addProductCategorySchema), controller.addCategory);

router.put("/update/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("edit_category"), upload.single("categoryImage"), validateRequest(updateProductCategorySchema), controller.updateCategory); 

router.delete("/delete/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("delete_category"), validateRequest(deleteProductCategorySchema), controller.deleteCategory);


export const productcategoryRoutes : Router = router;
