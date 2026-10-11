const pagination = (pageData) => {
  let limit = Number(pageData.limit || 10);
  let page = Number(pageData.page || 1);

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    page < 1 ||
    limit < 10 ||
    limit > 100
  ) {
    throw new AppError("Invalid page or limit", 400);
  }
  return { page, limit };
};

export default pagination;
