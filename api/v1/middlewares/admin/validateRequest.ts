import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

const validateRequest = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });

    req.body = parsedData.body;
    req.query = parsedData.query;
    req.params = parsedData.params;

    next();
  } catch (error: any) {
    return res.status(400).json({
      code: 400,
      message: "Validation error",
      errors: error.errors
    });
  }
};


export default validateRequest;
