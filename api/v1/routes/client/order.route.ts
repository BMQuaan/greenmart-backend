import express, { Router } from "express";
import * as controller from "../../controllers/client/order.controller";
import validateRequest from "../../middlewares/admin/validateRequest";
import { createOrderSchema } from "../../validations/client/order.validation";

const router: Router = express.Router();

router.post("/",validateRequest(createOrderSchema) , controller.createOrder);

export const orderRoutes:Router = router;
