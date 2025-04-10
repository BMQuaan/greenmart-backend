"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationHelper = void 0;
const paginationHelper = (objectPagination, query, countRecords) => {
    if (query.currentPage) {
        objectPagination.currentPage = parseInt(query.currentPage);
    }
    if (query.limitItems) {
        objectPagination.limitItems = parseInt(query.limitItems);
    }
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;
    const totalPage = Math.ceil(countRecords / objectPagination.limitItems);
    objectPagination.totalPage = totalPage;
    return objectPagination;
};
exports.paginationHelper = paginationHelper;
