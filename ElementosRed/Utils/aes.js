// ../Utils/aes.js
const crypto = require('crypto');

const aesKey = Buffer.from('1234567890abcdef', 'utf8'); // 16 bytes
const iv = Buffer.from('abcdef1234567890', 'utf8');     // 16 bytes

function decryptAES128(encryptedBase64) {
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);
  let decrypted = decipher.update(encryptedBuffer, null, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { decryptAES128 };

