import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Staff from "../../models/staff.model";
import "../../models/role.model";
import { uploadImageToCloudinary } from "../../../../helper/uploadCloudinary";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!JWT_REFRESH_SECRET) {
throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
}
// [POST] /api/v1/admin/staff/login
export const login = async (req: Request, res: Response) => {
  try {
    const { staffEmail, staffPassword } = req.body;

    const staff = await Staff.findOne({ staffEmail, deleted: false }).populate({
      path: "roleID",
      select: "_id roleName rolePermissions"
    });

    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Email does not exist",
      });
    }

    if (staff.staffStatus !== "active") {
      return res.status(403).json({
        code: 403,
        message: "Account is inactive",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(staffPassword, staff.staffPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        code: 400,
        message: "Incorrect email or password",
      });
    }

    const accessToken = jwt.sign(
      {
        id: staff._id,
        email: staff.staffEmail,
        role: staff.roleID._id, 
      },
      JWT_SECRET,
      { expiresIn: "6h" }
    );

    const refreshToken = jwt.sign(
      { id: staff._id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Lọc token hết hạn
    staff.staffRefreshTokens = staff.staffRefreshTokens.filter(tokenObj =>
      tokenObj.expiresAt && tokenObj.expiresAt > new Date()
    );

    // Giới hạn số lượng refreshToken
    if (staff.staffRefreshTokens.length >= 3) {
      staff.staffRefreshTokens.shift();
    }

    staff.staffRefreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    });

    await staff.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: COOKIE_SECURE, 
      sameSite: COOKIE_SECURE ? "none" : "lax", 
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      code: 200,
      message: "Login successful",
      accessToken: accessToken,
      info: {
        id: staff._id,
        name: staff.staffName,
        email: staff.staffEmail,
        phone: staff.staffPhone,
        address: staff.staffAddress,
        avatar: staff.staffAvatar,
        role: staff.roleID,
      },
    });
    

  } catch (error) {
    console.error("Staff login error:", error);
    return res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};

export const refreshStaffAccessToken = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) return res.sendStatus(401); 

  try {
    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string };

    const staff = await Staff.findOne({
      _id: decoded.id,
      deleted: false,
      "staffRefreshTokens.token": oldRefreshToken,
      "staffRefreshTokens.expiresAt": { $gt: new Date() }
    }).populate({
      path: "roleID",
      select: "_id roleName rolePermissions" 
    });

    if (!staff) {
      return res.sendStatus(403); 
    }

    staff.staffRefreshTokens = staff.staffRefreshTokens.filter(
      (tokenObj) => tokenObj.token !== oldRefreshToken
    );

    const newRefreshToken = jwt.sign(
      { id: staff._id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    staff.staffRefreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await staff.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: COOKIE_SECURE, 
      sameSite: COOKIE_SECURE ? "none" : "lax", 
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const newAccessToken = jwt.sign(
      {
        id: staff._id,
        email: staff.staffEmail,
        role: staff.roleID._id
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "6h" }
    );

    res.status(200).json({
      accessToken: newAccessToken,
      info: {
        id: staff._id,
        name: staff.staffName,
        email: staff.staffEmail,
        phone: staff.staffPhone,
        address: staff.staffAddress,
        avatar: staff.staffAvatar,
        role: staff.roleID,
      },
    });
  } catch (err) {
    console.error("Staff refresh token error:", err);
    return res.sendStatus(403);
  }
};

export const detail = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      code: 200,
      message: "Detail staff profile",
      info: req["infoStaff"],
    });
  } catch (error) {
    console.error("Error in staff detail:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const staffInfo = req["infoStaff"];
    const { staffName, staffPhone, staffAddress } = req.body;
    let avatarUrl: string | undefined;

    if (req.file) {
      avatarUrl = await uploadImageToCloudinary(req.file.buffer, "avatars");
    }

    const staff = await Staff.findById(staffInfo._id);
    if (!staff || staff.deleted || staff.staffStatus !== "active") {
      return res.status(404).json({ code: 404, message: "Staff not found or inactive" });
    }

    if (staffName !== undefined) staff.staffName = staffName;
    if (staffPhone !== undefined) staff.staffPhone = staffPhone;
    if (staffAddress !== undefined) staff.staffAddress = staffAddress;
    if (avatarUrl) staff.staffAvatar = avatarUrl;

    await staff.save();

    await staff.populate("roleID");

    return res.status(200).json({
      code: 200,
      message: "Staff updated successfully",
      info: {
        id: staff._id,
        name: staff.staffName,
        email: staff.staffEmail,
        phone: staff.staffPhone,
        address: staff.staffAddress,
        avatar: staff.staffAvatar,
        role: staff.roleID,
      },
    });
  } catch (error) {
    console.error("Update staff error:", error);
    return res.status(500).json({ code: 500, message: "Server error during update" });
  }
};

export const logoutStaff = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(200).json("Logged out!");
  }

  try {
    await Staff.updateOne(
      { 'staffRefreshTokens.token': refreshToken },
      { $pull: { staffRefreshTokens: { token: refreshToken } } }
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: COOKIE_SECURE, 
      sameSite: COOKIE_SECURE ? "none" : "lax", 
      path: "/",
    });

    return res.status(200).json("Logged out!");
  } catch (error) {
    console.error("Staff logout error:", error);
    return res.status(500).json("Server error during logout");
  }
};
