import { Router } from "express";
import * as controller from "../../controllers/admin/product.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import upload from "../../middlewares/admin/upload.middleware";
import { addProductSchema, updateProductSchema, deleteProductSchema } from "../../validations/admin/product.validation";
import validateRequest from "../../middlewares/admin/validateRequest";
import { parseFormDataNumbers } from "../../middlewares/admin/parseFormData.middleware";

const router: Router = Router();

router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_product"), controller.index);

router.get("/detail/:slugProduct", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_product"), controller.detail);

router.post("/add", authMiddleware.authenticateStaffToken, 
    authMiddleware.authorizePermission("add_product"), 
    upload.single("productImage"),
    parseFormDataNumbers(["productPrice", "productStock", "productPosition", "productDiscountPercentage"]),
    validateRequest(addProductSchema), 
    controller.addItem);

router.put("/update/:id", 
    authMiddleware.authenticateStaffToken, 
    authMiddleware.authorizePermission("edit_product"), 
    upload.single("productImage"),
    parseFormDataNumbers(["productPrice", "productStock", "productPosition", "productDiscountPercentage"]), 
    validateRequest(updateProductSchema), 
    controller.updateItem); 

router.delete("/delete/:id", 
    authMiddleware.authenticateStaffToken, 
    authMiddleware.authorizePermission("delete_product"), 
    validateRequest(deleteProductSchema), 
    controller.deleteItem);

export const productRoutes : Router = router;
