import { Router } from "express";
import * as controller from "../../controllers/admin/staff.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import upload from "../../middlewares/admin/upload.middleware";
import validateRequest from "../../middlewares/admin/validateRequest";
import { addStaffSchema, deleteStaffSchema, updateStaffSchema } from "../../validations/admin/staff.validation";

const router: Router = Router();

router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_staff"), controller.index);

router.get("/detail/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_staff"), controller.detail);

router.post("/add", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("add_staff"), upload.single("staffAvatar"), validateRequest(addStaffSchema), controller.addStaff);

router.put("/update/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("edit_staff"), upload.single("staffAvatar"), validateRequest(updateStaffSchema), controller.updateStaff);

router.delete("/delete/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("delete_staff"), validateRequest(deleteStaffSchema), controller.deleteStaff);

export const staffRoutes : Router = router;
