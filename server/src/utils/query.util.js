/**
 * Build a Mongoose query from request query parameters.
 * Supports: search, category, status, archived, sort, page, limit.
 */
const buildQuery = (queryParams, userId) => {
  const {
    search,
    category,
    status,
    archived,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = queryParams;

  const filter = { userId };

  // Text search on title and tags
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Category filter
  if (category && category !== 'All') {
    filter.category = category;
  }

  // Archived filter
  if (archived !== undefined) {
    filter.archived = archived === 'true';
  } else {
    // By default, do not show archived
    filter.archived = false;
  }

  // Sort mapping
  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'nearest-expiry': 'expiryDate',
    '-createdAt': '-createdAt',
    createdAt: 'createdAt',
    expiryDate: 'expiryDate',
  };

  const sortOption = sortMap[sort] || '-createdAt';

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  return {
    filter,
    sort: sortOption,
    skip,
    limit: limitNum,
    page: pageNum,
  };
};

module.exports = { buildQuery };
