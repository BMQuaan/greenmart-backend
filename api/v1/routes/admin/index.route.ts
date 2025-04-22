import { Express } from "express";
import { authRoutes } from "./auth.route";
import { productRoutes } from "./product.route";
import { productcategoryRoutes } from "./product-category.route";

const adminV1Routes = (app: Express): void => {
  const version: string = "/api/v1/admin";

  app.use(version + "/auth", authRoutes);
  
  app.use(version + "/products", productRoutes);

  app.use(version + "/products-category", productcategoryRoutes);

};

export default adminV1Routes;
