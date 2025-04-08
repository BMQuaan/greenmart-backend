import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";

export const requireAuth = async (
   req: Request, 
   res: Response, 
   next: NextFunction): Promise<void> => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    const user = await User.findOne({
      userToken: token,
      userIsDeleted: false,
    });
    if (!user) {
      res.json({
        code: 403,
        message: "Không có quyền truy cập",
      });
    } else {
      req["infoUser"] = user;
      next();
    }
  } else {
    res.json({
      code: 403,
      message: "Không có quyền truy cập",
    });
  }
};
