import express, { Router } from "express";
import * as controller from "../../controllers/client/order.controller";
import validateRequest from "../../middlewares/admin/validateRequest";
import { createOrderSchema } from "../../validations/client/order.validation";

const router: Router = express.Router();

router.post("/", validateRequest(createOrderSchema), controller.createOrder);

router.get("/", controller.getOrders);

router.get("/:id", controller.getOrderById);


router.patch("/cancel/:id", controller.cancelOrder);
export const orderRoutes:Router = router;
