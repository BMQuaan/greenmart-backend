import { Request, Response } from "express";
import User from "../models/user.model";
import md5 from "md5";
import { generateRandomString } from "../../../helper/generate";
// [POST] /api/v1/users/register
export const register = async (req: Request, res: Response) => {
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false,
  });
  if (existEmail) {
    res.json({
      code: 400,
      message: "Email đã tồn tại",
    });
    return;
  }
  const infoUser = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: md5(req.body.password),
    token: generateRandomString(30),
  };

  const user = new User(infoUser);
  await user.save();
  const token = user.userToken;
  res.cookie("token", token);
  res.json({
    code: 200,
    message: "Đăng kí thành công",
    token: token,
  });
};

// [POST] /api/v1/users/login
export const login = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });
  if (!user) {
    res.json({
      code: 400,
      message: "Email không tồn tại",
    });
    return;
  }
  if (md5(password) != user.userPassword) {
    res.json({
      code: 400,
      message: "Sai mật khẩu",
    });
    return;
  }
  const token = user.userToken;
  res.cookie("token", token);
  // res.status(400).json();
  res.json({
    code: 200,
    message: "Đăng nhập thành công",
    token: token,
  });
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
     code: 400,
     message: "Error",
   });
 }
};
