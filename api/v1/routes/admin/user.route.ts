import { Router } from "express";
import * as controller from "../../controllers/admin/user.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import upload from "../../middlewares/admin/upload.middleware";
import validateRequest from "../../middlewares/admin/validateRequest";
import { deleteUserSchema, updateUserSchema } from "../../validations/admin/user.validation";

const router: Router = Router();

router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_user"), controller.index);

router.get("/detail/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_user"), controller.detail);

router.put("/update/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("edit_user"), upload.single("userAvatar"),validateRequest(updateUserSchema) , controller.updateUser);
  
router.delete("/delete/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("delete_user"), validateRequest(deleteUserSchema), controller.deleteUser);

export const userRoutes : Router = router;
