import { Express } from "express";
import { userRoutes } from "./user.route";
import { productRoutes } from "./product.route";
import { productcategoryRoutes } from "./product-category.route";
import { wishlistRoutes } from "./wishlist.route";
import { cartRoutes } from "./cart.route";
import { orderRoutes } from "./order.route";
import * as authMiddleware from "../../middlewares/client/auth.middleware";

const mainV1Routes = (app: Express): void => {
  const version: string = "/api/v1";
  app.use(version + "/users",userRoutes );

  app.use(version + "/products", productRoutes);

  app.use(version + "/products-category", productcategoryRoutes);

  app.use(version + "/wishlist", authMiddleware.authenticateToken, wishlistRoutes);

  app.use(version + "/cart", authMiddleware.authenticateToken, cartRoutes);

  app.use(version + "/orders", authMiddleware.authenticateToken, orderRoutes);
};

export default mainV1Routes;
