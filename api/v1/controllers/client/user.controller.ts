import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";
import dotenv from "dotenv";

dotenv.config(); 

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
}
// [POST] /api/v1/users/register
export const register = async (req: Request, res: Response) => {
  try {
    const { userName, userEmail, userPassword } = req.body;

    if (!userName || !userEmail || !userPassword) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    const existUser = await User.findOne({
      userEmail: userEmail,
      deleted: false,
    });

    if (existUser) {
      res.status(400).json({
        code: 400,
        message: "Email already exists",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);
    const newUser = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
    });

    const refreshToken = jwt.sign({ id: newUser._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
    newUser.userRefreshTokens = [
      {
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];

    await newUser.save();

    const accessToken = jwt.sign(
      { id: newUser._id, email: newUser.userEmail },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      code: 200,
      message: "Registration successful",
      accessToken: accessToken,
      // user: {
      //   id: newUser._id,
      //   name: newUser.userName,
      //   email: newUser.userEmail,
      // },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};

// [POST] /api/v1/users/login
export const login = async (req: Request, res: Response) => {
  try {
    const { userEmail, userPassword } = req.body;

    const user = await User.findOne({ userEmail: userEmail, deleted: false });

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Email does not exist",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        code: 400,
        message: "Incorrect information",
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, userEmail: user.userEmail },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    // Xoá các token đã hết hạn
    user.userRefreshTokens = user.userRefreshTokens.filter(tokenObj => {
      return tokenObj.expiresAt && tokenObj.expiresAt > new Date();
    });

    // Nếu có quá 3 token, xoá token cũ nhất
    if (user.userRefreshTokens.length >= 3) {
      user.userRefreshTokens.shift();
    }
    
    user.userRefreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      code: 200,
      message: "Login successful",
      // info: {
      //   id: user._id,
      //   name: user.userName,
      //   email: user.userEmail,
      //   avatar: user.userAvatar,
      // },
      accessToken: accessToken,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};

// [GET] /api/v1/users/refresh-token
export const refreshAccessToken = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string };

    const user = await User.findOne({
      _id: decoded.id,
      deleted: false,
      'userRefreshTokens.token': oldRefreshToken,
      'userRefreshTokens.expiresAt': { $gt: new Date() },
    });

    if (!user) {
      return res.sendStatus(403);
    }

    user.userRefreshTokens = user.userRefreshTokens.filter(
      (tokenObj) => tokenObj.token !== oldRefreshToken
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    user.userRefreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const newAccessToken = jwt.sign(
      { id: user._id, email: user.userEmail },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('Refresh token error:', err);
    return res.sendStatus(403);
  }
};



// [GET] /api/v1/users/detail
export const detail = async (req: Request, res: Response) => {
 try {
   res.json({
     code: 200,
     message: "Detail profile",
     info: req["infoUser"],
   });
 } catch (error) {
   res.json({
     code: 500,
     message: "Error",
   });
 }
};

// [PUT] /api/v1/users/update
export const update = async (req: Request, res: Response) => {
  try {
    const userInfo = req["infoUser"];
    const { userName, userPhone, userAvatar, userAddress } = req.body;

    const user = await User.findById(userInfo._id);
    if (!user || user.deleted || user.userStatus !== "active") {
      return res.status(404).json({ code: 404, message: "User not found or inactive" });
    }

    if (userName) user.userName = userName;
    if (userPhone) user.userPhone = userPhone;
    if (userAvatar) user.userAvatar = userAvatar;
    if (userAddress) user.userAddress = userAddress;

    await user.save();

    return res.status(200).json({
      code: 200,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.userName,
        email: user.userEmail,
        phone: user.userPhone,
        address: user.userAddress,
        avatar: user.userAvatar,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ code: 500, message: "Server error during update" });
  }
};


// [POST] /api/v1/users/logout
export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(200).json("Logged out!"); 
  }

  try {
    const user = await User.findOne({ 'userRefreshTokens.token': refreshToken });

    if (user) {
      user.userRefreshTokens = user.userRefreshTokens.filter(
        tokenObj => tokenObj.token !== refreshToken
      );
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json("Logged out!");
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json("Server error during logout");
  }
};
