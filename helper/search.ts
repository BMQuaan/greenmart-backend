interface ObjectSearch {
  keyword: string;
  regex?: RegExp;
}

export const SearchHelper = (query) : ObjectSearch => {
  let objectSearch: ObjectSearch = {
    keyword: "",
  };
  if (query.keyword) {
    objectSearch.keyword = query.keyword;
    const regex = new RegExp(objectSearch.keyword, "i");
    objectSearch.regex = regex;
  }
  return objectSearch;
};



