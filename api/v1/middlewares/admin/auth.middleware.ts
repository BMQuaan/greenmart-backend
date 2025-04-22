import { Request, Response, NextFunction } from "express";
import Staff from "../../models/staff.model";
import jwt from "jsonwebtoken";

export const authenticateStaffToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Access token not provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      userEmail: string;
      role: string;
    };

    const staff = await Staff.findOne({
      _id: decoded.id,
      deleted: false,
      staffStatus: "active"
    })
      .select("staffName staffEmail staffPhone staffAvatar staffAddress roleID")
      .populate("roleID", "_id roleName roleDescription rolePermissions"); // chỉ lấy trường cần

    if (!staff) {
      return res.status(403).json({ message: "Account is invalid or has been disabled" });
    }

    req["infoStaff"] = staff;
    next();
  } catch (err) {
    console.error("Staff auth middleware error:", err);
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};


export const authorizePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const staff = req["infoStaff"];

    if (!staff || !staff.roleID || !Array.isArray(staff.roleID.rolePermissions)) {
      return res.status(403).json({ message: "Access denied. Invalid role info." });
    }

    const hasPermission = staff.roleID.rolePermissions.includes(permission);

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied. Missing permission!"});
    }

    next();
  };
};
