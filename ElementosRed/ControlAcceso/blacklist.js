// blacklist.js
const blacklist = new Set([
]);

function isBlacklisted(ip) {
  return blacklist.has(ip);
}

module.exports = { isBlacklisted, blacklist };

