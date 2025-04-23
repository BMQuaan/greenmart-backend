import { Router } from "express";
import * as controller from "../../controllers/admin/product.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import upload from "../../middlewares/admin/upload.middleware";


const router: Router = Router();

router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_product"), controller.index);

router.get("/detail/:slugProduct", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_product"), controller.detail);

router.post("/add", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("add_product"), upload.single("productImage"), controller.addItem);

router.put("/update/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("edit_product"), upload.single("productImage"), controller.updateItem); 

router.delete("/delete/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("delete_product"), controller.deleteItem);

export const productRoutes : Router = router;
