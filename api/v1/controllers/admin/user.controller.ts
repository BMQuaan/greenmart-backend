import { Request, Response } from "express";
import UserModel, { IUser } from "../../models/user.model";
import { SearchHelper } from "../../../../helper/search";
import { paginationHelper } from "../../../../helper/pagination";
import mongoose from "mongoose";

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

    res.json({
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
    }).select("-userPassword -userRefreshTokens");

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found"
      });
    }

    res.json({
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
