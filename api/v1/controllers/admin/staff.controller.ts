import { Request, Response } from "express";
import StaffModel, { IStaff } from "../../models/staff.model";
import { SearchHelper } from "../../../../helper/search";
import { paginationHelper } from "../../../../helper/pagination";
import mongoose from "mongoose";
import { uploadImageToCloudinary } from "../../../../helper/uploadCloudinary";
import bcrypt from "bcrypt";

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

    res.status(200).json({
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
      .populate("roleID", "roleName")
      .populate("createBy.staffID", "staffName")
      .populate("updateBy.staffID", "staffName")
      .populate("deleteBy.staffID", "staffName")
      .select("-__v");

    if (!staff) {
      return res.status(404).json({
        code: 404,
        message: "Staff not found"
      });
    }

    res.status(200).json({
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

//POST /add
export const addStaff = async (req: Request, res: Response) => {
  try {
    const {
      staffName,
      staffEmail,
      staffPassword,
      staffPhone,
      staffAddress,
      roleID
    } = req.body;

    const infoStaff = req["infoStaff"];

    if (!staffName || !staffEmail || !staffPassword || !staffPhone || !roleID) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await StaffModel.findOne({ staffEmail, deleted: false });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let avatarUrl = "";
    if (req.file) {
      avatarUrl = await uploadImageToCloudinary(req.file.buffer, "staffs");
    }

    const hashedPassword = await bcrypt.hash(staffPassword, 10);

    const newStaff = new StaffModel({
      staffName,
      staffEmail,
      staffPassword: hashedPassword,
      staffPhone,
      staffAvatar: avatarUrl,
      staffAddress,
      roleID,
      createBy: {
        staffID: infoStaff._id,
        date: new Date()
      }
    });

    await newStaff.save();

    return res.status(201).json({ message: "Staff created" });
  } catch (error) {
    console.error("Add staff error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//PUT /update/:id
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const staffID = req.params.id;
    const {
      staffName,
      staffEmail,
      staffPassword,
      staffPhone,
      staffAddress,
      staffStatus,
      roleID
    } = req.body;

    const infoStaff = req["infoStaff"];

    const staff = await StaffModel.findOne({ _id: staffID, deleted: false });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (req.file) {
      const avatarUrl = await uploadImageToCloudinary(req.file.buffer, "staffs");
      staff.staffAvatar = avatarUrl;
    }

    if (staffName) staff.staffName = staffName;
    if (staffEmail) staff.staffEmail = staffEmail;
    if (staffPhone) staff.staffPhone = staffPhone;
    if (staffAddress) staff.staffAddress = staffAddress;
    if (staffStatus) staff.staffStatus = staffStatus;
    if (roleID) staff.roleID = roleID;

    if (staffPassword) {
      const hashedPassword = await bcrypt.hash(staffPassword, 10);
      staff.staffPassword = hashedPassword;
    }

    staff.updateBy?.push({
      staffID: infoStaff._id,
      date: new Date()
    });

    await staff.save();

    return res.status(200).json({
      code: 200,
      message: "Staff updated successfully",
      // info: staff
    });

  } catch (error) {
    console.error("Error updating staff:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const infoStaff = req["infoStaff"];

    const staff = await StaffModel.findOne({ _id: id, deleted: false });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.deleted = true;
    staff.deleteBy = {
      staffID: infoStaff._id,
      date: new Date()
    };

    await staff.save();

    return res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
