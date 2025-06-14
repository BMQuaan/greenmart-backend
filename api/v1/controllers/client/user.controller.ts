import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../../models/user.model";
import ForgotPasswordModel from "../../models/forgot-password.model";
import { sendMail } from "../../../../helper/sendmail"; 
import crypto from "crypto";
import dotenv from "dotenv";
import cloudinary from "../../../../config/cloudinary";
import { updateUserSchema } from "../../validations/client/user.validation";

dotenv.config(); 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

    const trimmedUserName = userName?.trim();
    const trimmedUserEmail = userEmail?.trim();

    if (!trimmedUserName || !trimmedUserEmail || !userPassword) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    const existUser = await User.findOne({
      userEmail: trimmedUserEmail,
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
      userName: trimmedUserName,
      userEmail: trimmedUserEmail,
      userPassword: hashedPassword,
      loginType: "local",
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
      { expiresIn: "6h" }
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

    if (!userEmail || !userPassword) {
      return res.status(400).json({
        code: 400,
        message: "Please provide email and password",
      });
    }

    const trimmedUserEmail = userEmail?.trim();

    const user = await User.findOne({ userEmail: trimmedUserEmail, deleted: false });

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Email does not exist",
      });
    }

    if (user.userStatus === "inactive") {
      return res.status(403).json({
        code: 403,
        message: "This account has been deactivated",
      });
    }

    if (user.loginType !== "local" || !user.userPassword) {
      return res.status(400).json({
        code: 400,
        message: "This account does not support password login",
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
      { expiresIn: "6h" }
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

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "Access token is required" });
    }

    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!googleRes.ok) {
      return res.status(401).json({ message: "Invalid Google access token" });
    }

    const profile = await googleRes.json();
    const { email, name, picture } = profile;

    if (!email) {
      return res.status(400).json({ message: "Email not found in Google profile" });
    }

    let user = await User.findOne({ userEmail: email, deleted: false });

    if (!user) {
      user = new User({
        userName: name,
        userEmail: email,
        userAvatar: picture,
        loginType: "google",
        userRefreshTokens: [],
      });
    }

    if (user.userStatus === "inactive") {
      return res.status(403).json({ message: "This account has been deactivated" });
    }


    // Xử lý refresh tokens
    user.userRefreshTokens = user.userRefreshTokens.filter(
      (tokenObj) => tokenObj.expiresAt && tokenObj.expiresAt > new Date()
    );

    if (user.userRefreshTokens.length >= 3) {
      user.userRefreshTokens.shift();
    }

    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
    const accessToken = jwt.sign(
      { id: user._id, userEmail: user.userEmail },
      JWT_SECRET,
      { expiresIn: "6h" }
    );

    user.userRefreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Google login successful",
      accessToken,
    });
  } catch (error) {
    console.error("Google login error", error);
    return res.status(500).json({ message: "Google login failed" });
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
      { expiresIn: "6h" }
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
   res.status(200).json({
     code: 200,
     message: "Detail profile",
     info: req["infoUser"],
   });
 } catch (error) {
   res.status(500).json({
     code: 500,
     message: "Error",
   });
 }
};

// [PUT] /api/v1/users/update
export const update = async (req: Request, res: Response) => {
  try {
    const parsedData = updateUserSchema.safeParse({
      body: req.body,
    });

    if (!parsedData.success) {
      const errorMessages = parsedData.error.errors.map(err => err.message);
      return res.status(400).json({
        code: 400,
        message: "Validation failed",
        errors: errorMessages,
      });
    }

    const userInfo = req["infoUser"];
    const { userName, userPhone, userAddress } = parsedData.data.body;
    let avatarUrl: string | undefined;

    if (req.file) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "users" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({ secure_url: result.secure_url });
          }
        );
        stream.end(req.file.buffer);
      });

      avatarUrl = uploadResult.secure_url;
    }

    const user = await User.findById(userInfo._id);
    if (!user || user.deleted || user.userStatus !== "active") {
      return res.status(404).json({ code: 404, message: "User not found or inactive" });
    }

    if (userName !== undefined) user.userName = userName;
    if (userPhone !== undefined) user.userPhone = userPhone;
    if (userAddress !== undefined) user.userAddress = userAddress;
    if (avatarUrl) user.userAvatar = avatarUrl;

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

// POST /password/change
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userInfo = req["infoUser"]; 

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    const user = await User.findById(userInfo._id).select("+userPassword");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.userPassword || user.loginType !== 'local') {
      return res.status(400).json({ message: "This account does not support password change" });
    }


    const isMatch = await bcrypt.compare(currentPassword, user.userPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.userPassword = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
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

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ userEmail: email, deleted: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.loginType !== 'local') {
      return res.status(400).json({ message: "This account does not support password reset via email" });
    }

    const recentRequests = await ForgotPasswordModel.countDocuments({
      fpEmail: email,
      fpUsed: false,
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
    });
    
    if (recentRequests >= 3) {
      return res.status(429).json({ message: "Too many password reset requests. Please try again later." });
    }
    

    const otp = crypto.randomBytes(3).toString("hex"); 
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + 5);

    // const existingForgotPassword = await ForgotPasswordModel.findOne({ fpEmail: email, fpUsed: false });
    // if (existingForgotPassword) {
    //   return res.status(400).json({ message: "A password reset request is already in progress." });
    // }

    const forgotPassword = new ForgotPasswordModel({
      fpUserId: user._id,
      fpEmail: email,
      fpOTP: otp,
      fpExpireAt: expireAt,
      fpUsed: false,
    });

    await forgotPassword.save();

    const subject = "Password Reset OTP";
    const html = `
                  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #f0fff4; max-width: 600px; margin: auto;">
                    <h2 style="color: #27ae60;">🔒 Password Reset Request</h2>
                    <p style="font-size: 18px; color: #555;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">We received a request to reset your password. Please use the OTP below to complete the process:</p>
                    <div style="padding: 15px; background-color: #d4edda; border-radius: 4px; font-size: 20px; font-weight: bold; color: #155724; display: inline-block; margin: 20px 0;">
                      ${otp}
                    </div>
                    <p style="font-size: 14px; color: #777;">This OTP is valid for the next 5 minutes. If you did not request a password reset, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #aaa;">Thank you for securing your account with us!</p>
                  </div>
                `
    await sendMail({ email, subject, html });

    return res.status(200).json({ message: "OTP sent successfully." });
  } catch (err) {
    console.error("Error in password reset request:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const forgotPassword = await ForgotPasswordModel.findOne({
      fpEmail: email,
      fpOTP: otp,
      fpUsed: false,
    });

    if (!forgotPassword) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (forgotPassword.fpExpireAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.loginType !== "local") {
      return res.status(400).json({ message: "This account does not support password reset via OTP." });
    }

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    ); 

    user.userRefreshTokens = user.userRefreshTokens.filter(tokenObj => {
      return tokenObj.expiresAt && tokenObj.expiresAt > new Date();
    });

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

    forgotPassword.fpUsed = true;
    await forgotPassword.save();

    return res.status(200).json({ message: "OTP verified. You may now reset your password." });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body; 
    const user = req["infoUser"];
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.userPassword = hashedPassword;

    if (user.loginType === "google") {
      user.loginType = "local";
    }

    await user.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};