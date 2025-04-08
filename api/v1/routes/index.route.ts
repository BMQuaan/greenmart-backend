import { taskRoutes } from "./task.route";
import { Express } from "express";
import { userRoutes } from "./user.route";
import { productRoutes } from "./product.route";
import { productcategoryRoutes } from "./product-category.route"
import * as authMiddleware from "../middlewares/auth.middleware";

const mainV1Routes = (app: Express): void => {
  const version: string = "/api/v1";
  app.use(version + "/tasks",authMiddleware.requireAuth, taskRoutes);

  app.use(version + "/users",userRoutes )

  app.use(version + "/products", productRoutes)

  app.use(version + "/products-category", productcategoryRoutes)
};

export default mainV1Routes;
