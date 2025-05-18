import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";
import jwt from "jsonwebtoken";

export const authenticateToken =async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access token not provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const user = await User.findOne({
      _id: decoded.id,
      deleted: false,
      userStatus: "active"
    }).select("userName userEmail userPhone userAvatar userAddress loginType");
    
    if (!user) {
      return res.status(403).json({ message: "Account is invalid or has been disabled" });
    }    

    req["infoUser"] = user;
    next();
  } catch (err) {
    console.error("Middleware auth error:", err);
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};
