import { Router } from "express";
import * as controller from "../../controllers/client/cart.controller";

const router = Router();

router.get("/", controller.index);

router.post("/add", controller.addToCart);

router.put("/update", controller.updateQuantity);

router.delete("/delete", controller.deleteFromCart);

router.delete("/clear", controller.clearCart);

export const cartRoutes = router;
