"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.detail = exports.refreshAccessToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
}
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, userEmail, userPassword } = req.body;
        if (!userName || !userEmail || !userPassword) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        const existUser = yield user_model_1.default.findOne({
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
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(userPassword, salt);
        const newUser = new user_model_1.default({
            userName,
            userEmail,
            userPassword: hashedPassword,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: newUser._id }, JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });
        newUser.userRefreshTokens = [
            {
                token: refreshToken,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        ];
        yield newUser.save();
        const accessToken = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.userEmail }, JWT_SECRET, { expiresIn: "15m" });
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
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userEmail, userPassword } = req.body;
        const user = yield user_model_1.default.findOne({ userEmail: userEmail, deleted: false });
        if (!user) {
            return res.status(400).json({
                code: 400,
                message: "Email does not exist",
            });
        }
        const isPasswordCorrect = yield bcrypt_1.default.compare(userPassword, user.userPassword);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                code: 400,
                message: "Incorrect password",
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, userEmail: user.userEmail }, JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
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
        yield user.save();
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
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
});
exports.login = login;
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken)
        return res.sendStatus(401);
    try {
        const decoded = jsonwebtoken_1.default.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
        const user = yield user_model_1.default.findOne({
            _id: decoded.id,
            deleted: false,
            'userRefreshTokens.token': oldRefreshToken,
            'userRefreshTokens.expiresAt': { $gt: new Date() },
        });
        if (!user) {
            return res.sendStatus(403);
        }
        user.userRefreshTokens = user.userRefreshTokens.filter((tokenObj) => tokenObj.token !== oldRefreshToken);
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        user.userRefreshTokens.push({
            token: newRefreshToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        yield user.save();
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.userEmail }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.status(200).json({ accessToken: newAccessToken });
    }
    catch (err) {
        console.error('Refresh token error:', err);
        return res.sendStatus(403);
    }
});
exports.refreshAccessToken = refreshAccessToken;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({
            code: 200,
            message: "Detail profile",
            info: req["infoUser"],
        });
    }
    catch (error) {
        res.json({
            code: 500,
            message: "Error",
        });
    }
});
exports.detail = detail;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(200).json("Logged out!");
    }
    try {
        const user = yield user_model_1.default.findOne({ 'userRefreshTokens.token': refreshToken });
        if (user) {
            user.userRefreshTokens = user.userRefreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
            yield user.save();
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
        });
        return res.status(200).json("Logged out!");
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json("Server error during logout");
    }
});
exports.logout = logout;
