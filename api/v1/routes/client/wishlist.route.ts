import express, { Router } from "express";
const router: Router = express.Router();
import * as controller from "../../controllers/client/wishlist.controller";

router.get("/", controller.index);

router.post("/add", controller.addPost);

router.delete("/delete", controller.deleteItem);

router.delete("/clear", controller.clear);

export const wishlistRoutes:Router = router;
