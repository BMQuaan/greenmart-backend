import { Request, Response } from "express";
import StaffModel, { IStaff } from "../../models/staff.model";
import { SearchHelper } from "../../../../helper/search";
import { paginationHelper } from "../../../../helper/pagination";
import mongoose from "mongoose";

// [GET] /staffs
export const index = async (req: Request, res: Response) => {
  try {
    const objectSearch = SearchHelper(req.query);

    const find: Record<string, any> = {
      deleted: false,
    };

    if (req.query.keyword) {
      const regex = objectSearch.regex;
      find["$or"] = [
        { staffName: regex },
      ];
    }

    // const initPagination = {
    //   currentPage: 1,
    //   limitItems: 10
    // };

    // const countStaffs = await StaffModel.countDocuments(find);
    // const objectPagination = paginationHelper(initPagination, req.query, countStaffs);
    // objectPagination.totalItem = countStaffs;

    const sort: Record<string, any> = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey.toString()] = req.query.sortValue;
    } else {
      sort.createdAt = "desc";
    }

    const staffs = await StaffModel.find(find)
        .select("-staffPassword -staffRefreshTokens")
      .populate("roleID", "roleName")
      .sort(sort)
    //   .limit(objectPagination.limitItems)
    //   .skip(objectPagination.skip);

    res.json({
      code: 200,
      message: "Staffs list",
      info: staffs,
    //   pagination: objectPagination
    });
  } catch (error) {
    console.error("Error in staff index:", error);
    res.status(500).json({
      code: 500,
      message: "Server error"
    });
  }
};

// [GET] /staffs/detail/:id
export const detail = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const staff = await StaffModel.findOne({
      _id: req.params.id,
      deleted: false
    })
      .select("-staffPassword -staffRefreshTokens")
      .populate("roleID", "roleName");

    if (!staff) {
      return res.status(404).json({
        code: 404,
        message: "Staff not found"
      });
    }

    res.json({
      code: 200,
      message: "Staff detail",
      info: staff
    });
  } catch (error) {
    console.error("Error in staff detail:", error);
    res.status(500).json({
      code: 500,
      message: "Server error"
    });
  }
};
