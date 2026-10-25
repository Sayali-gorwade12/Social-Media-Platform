function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidUsername(username) {
  if (typeof username !== 'string') return false;
  // 3 to 30 characters, alphanumeric and underscore
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username.trim());
}

function isValidUrl(urlString) {
  if (!urlString) return true; // Optional
  if (typeof urlString !== 'string') return false;
  // Support Base64 data URLs uploaded directly from user device/PC
  if (urlString.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

module.exports = {
  isValidEmail,
  isValidUsername,
  isValidUrl,
  sanitizeText
};
