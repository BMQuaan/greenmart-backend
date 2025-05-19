import { Express } from "express";
import { authRoutes } from "./auth.route";
import { productRoutes } from "./product.route";
import { productcategoryRoutes } from "./product-category.route";
import { userRoutes } from "./user.route";
import { staffRoutes } from "./staff.route";
import { overViewRoutes } from "./overview.route";
import { orderRoutes } from "./order.route";

const adminV1Routes = (app: Express): void => {
  const version: string = "/api/v1/admin";

  app.use(version + "/auth", authRoutes);
  
  app.use(version + "/products", productRoutes);

  app.use(version + "/products-category", productcategoryRoutes);

  app.use(version + "/users", userRoutes);

  app.use(version + "/staffs", staffRoutes);

  app.use(version + "/overview", overViewRoutes);
  
  app.use(version + "/orders", orderRoutes);
};

export default adminV1Routes;
