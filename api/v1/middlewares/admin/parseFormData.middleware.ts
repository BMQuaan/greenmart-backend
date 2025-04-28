import { Request, Response, NextFunction } from "express";

export function parseFormDataNumbers(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      const value = req.body[field];
      if (value !== undefined && typeof value === "string") {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
          req.body[field] = parsedValue;
        }
      }
    }
    next();
  };
}
