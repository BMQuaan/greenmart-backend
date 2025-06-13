"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFormDataNumbers = parseFormDataNumbers;
function parseFormDataNumbers(fields) {
    return (req, res, next) => {
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
