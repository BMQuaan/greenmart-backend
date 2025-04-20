import express, { Router } from "express";
import * as controller from "../../controllers/client/order.controller";

const router: Router = express.Router();

router.post("/", controller.createOrder);

export const orderRoutes:Router = router;
