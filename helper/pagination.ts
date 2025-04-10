interface ObjectPagination {
  currentPage: number;
  limitItems: number;
  skip?: number;
  totalPage?: number;
}

export const paginationHelper = (objectPagination: ObjectPagination,
   query: Record<string, any>, 
   countRecords :number
   ) : ObjectPagination => {
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
