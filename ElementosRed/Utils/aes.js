// ../Utils/aes.js
const crypto = require('crypto');

const aesKey = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF,
                            0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
const iv = Buffer.from([0xAB, 0xCD, 0xEF, 0x12, 0x34, 0x56, 0x78, 0x90,
                        0xAB, 0xCD, 0xEF, 0x12, 0x34, 0x56, 0x78, 0x90]);
// ¿Correcto? NO, veamos por qué


function decryptAES128(encryptedBase64) {
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);
  let decrypted = decipher.update(encryptedBuffer, null, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { decryptAES128 };

