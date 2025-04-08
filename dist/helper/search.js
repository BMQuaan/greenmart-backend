"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchHelper = void 0;
const SearchHelper = (query) => {
    let objectSearch = {
        keyword: "",
    };
    if (query.keyword) {
        objectSearch.keyword = query.keyword;
        const regex = new RegExp(objectSearch.keyword, "i");
        objectSearch.regex = regex;
    }
    return objectSearch;
};
exports.SearchHelper = SearchHelper;
