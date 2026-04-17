const Document = require('../models/Document');
const Notification = require('../models/Notification');
const { computeStatus } = require('../utils/status.util');
const { CATEGORIES } = require('../constants/documentStatus');

/**
 * Get complete dashboard summary for a user.
 */
const getDashboardSummary = async (userId) => {
  // Fetch all user documents
  const allDocs = await Document.find({ userId }).lean();

  // Compute status for each
  const docs = allDocs.map((doc) => ({
    ...doc,
    status: computeStatus(doc),
  }));

  // Counts
  const total = docs.length;
  const active = docs.filter((d) => d.status === 'Active').length;
  const expiringSoon = docs.filter((d) => d.status === 'Expiring Soon').length;
  const expired = docs.filter((d) => d.status === 'Expired').length;
  const archived = docs.filter((d) => d.status === 'Archived').length;

  // Recently uploaded (last 5, non-archived)
  const recentDocuments = docs
    .filter((d) => !d.archived)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Upcoming expiry (next 5 documents expiring soon, non-archived)
  const upcomingExpiry = docs
    .filter(
      (d) =>
        !d.archived &&
        d.expiryDate &&
        new Date(d.expiryDate) > new Date()
    )
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 5);

  // Category summary
  const categorySummary = CATEGORIES.map((cat) => ({
    category: cat,
    count: docs.filter((d) => d.category === cat && !d.archived).length,
  })).filter((c) => c.count > 0);

  // Unread notifications count
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  return {
    stats: { total, active, expiringSoon, expired, archived },
    recentDocuments,
    upcomingExpiry,
    categorySummary,
    unreadNotifications: unreadCount,
  };
};

module.exports = { getDashboardSummary };
