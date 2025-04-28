import { Request, Response } from "express";
import UserModel, { IUser } from "../../models/user.model";
import { SearchHelper } from "../../../../helper/search";
import { paginationHelper } from "../../../../helper/pagination";
import mongoose from "mongoose";
import { uploadImageToCloudinary } from "../../../../helper/uploadCloudinary";


// [GET] /users
export const index = async (req: Request, res: Response) => {
  try {
    interface IUserFind {
      deleted: boolean;
      userStatus?: string;
      userName?: RegExp;
      userEmail?: RegExp;
    }

    const objectSearch = SearchHelper(req.query);

    const find: IUserFind = {
      deleted: false,
    };

    if (req.query.keyword) {
      const regex = objectSearch.regex;
      find["$or"] = [
        { userName: regex },
      ];
    }

    // const initPagination = {
    //   currentPage: 1,
    //   limitItems: 10,
    // };

    // const countUsers = await UserModel.countDocuments(find);
    // const objectPagination = paginationHelper(initPagination, req.query, countUsers);
    // objectPagination.totalItem = countUsers;

    // Sort
    const sort: Record<string, any> = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey.toString()] = req.query.sortValue;
    } else {
      sort.createdAt = "desc";
    }

    const users = await UserModel.find(find)
      .sort(sort)
      .select("-userPassword -userRefreshTokens");
    //   .limit(objectPagination.limitItems)
    //   .skip(objectPagination.skip);

    res.status(200).json({
      code: 200,
      message: "Users list",
      info: users,
    //   pagination: objectPagination
    });
  } catch (error) {
    console.error("Error in user index:", error);
    res.status(500).json({
      code: 500,
      message: "Server error"
    });
  }
};

// [GET] /users/detail/:id
export const detail = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await UserModel.findOne({
      _id: req.params.id,
      deleted: false
    }).select("-userPassword -userRefreshTokens")
    .populate("updateBy.staffID", "staffName")
    .populate("deleteBy.staffID", "staffName")
    .select("-__v");

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found"
      });
    }

    res.status(200).json({
      code: 200,
      message: "User detail",
      info: user
    });
  } catch (error) {
    console.error("Error in user detail:", error);
    res.status(500).json({
      code: 500,
      message: "Server error"
    });
  }
};

// PUT /update/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userID = req.params.id;
    const {
      userName,
      userPhone,
      userAddress,
      userStatus
    } = req.body;

    const infoStaff = req["infoStaff"];

    const user = await UserModel.findOne({ _id: userID, deleted: false });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.userEmail || req.body.userPassword) {
      return res.status(400).json({ message: "Email and password cannot be updated here." });
    }

    if (userName) user.userName = userName;
    if (userPhone) user.userPhone = userPhone;
    if (userAddress) user.userAddress = userAddress;
    if (userStatus) user.userStatus = userStatus;

    if (req.file) {
      const avatarUrl = await uploadImageToCloudinary(req.file.buffer, "users");
      user.userAvatar = avatarUrl;
    }

    user.updateBy?.push({
      staffID: infoStaff._id,
      date: new Date()
    });

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      // info: user
    });

  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//DELETE /delete/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userID = req.params.id;
    const infoStaff = req["infoStaff"];

    const user = await UserModel.findOne({ _id: userID, deleted: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.deleted = true;
    user.deleteBy = {
      staffID: infoStaff._id,
      date: new Date()
    };

    await user.save();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
