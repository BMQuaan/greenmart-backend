import { Express } from "express";
import { staffRoutes } from "./staff.route";

const adminV1Routes = (app: Express): void => {
  const version: string = "/api/v1/admin";

  app.use(version + "/staffs", staffRoutes);
};

export default adminV1Routes;
