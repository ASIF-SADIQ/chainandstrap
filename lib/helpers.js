export function formatPrice(price) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function generateSlug(vendor) {
  if (!vendor) return "";
  return vendor.toLowerCase().replace(/\s+/g, '-');
}

export function parseVendor(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, ' ');
}

export function parseImages(imagesString) {
  if (!imagesString) return [];
  try {
    const parsed = JSON.parse(imagesString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function parseTags(tagsString) {
  if (!tagsString) return [];
  try {
    const parsed = JSON.parse(tagsString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
