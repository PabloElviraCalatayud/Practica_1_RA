// blacklist.js
const blacklist = new Set([
  '127.0.0.1',          // Bloquea localhost
]);

function isBlacklisted(ip) {
  return blacklist.has(ip);
}

module.exports = { isBlacklisted, blacklist };

