import Task from "../../models/task.model";
import {Router } from "express";

import * as controller from "../../controllers/client/task.controller";
const router:Router = Router();

router.get("/", controller.index);

router.get("/detail/:id",controller.detail);

router.patch("/change-status/:id",controller.changeStatus);

router.patch("/change-multi",controller.changeMulti);

router.post("/create",controller.create);

router.patch("/edit/:id", controller.edit);

router.patch("/delete/:id", controller.deleteTask);

export const taskRoutes:Router = router;
