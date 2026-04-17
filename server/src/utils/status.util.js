/**
 * Compute the display status for a document based on its state.
 *
 * Rules:
 *  - archived === true       → 'Archived'
 *  - expiryDate is in past   → 'Expired'
 *  - expiryDate within 30d   → 'Expiring Soon'
 *  - otherwise               → 'Active'
 */
const computeStatus = (doc) => {
  if (doc.archived) return 'Archived';

  if (!doc.expiryDate) return 'Active';

  const now = new Date();
  const expiry = new Date(doc.expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays <= 30) return 'Expiring Soon';
  return 'Active';
};

module.exports = { computeStatus };
