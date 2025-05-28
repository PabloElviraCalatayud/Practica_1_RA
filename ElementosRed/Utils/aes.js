const crypto = require('crypto');

const aesKey = Buffer.from([
  0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF,
  0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF
]);

const iv = Buffer.from([
  0xAB, 0xCD, 0xEF, 0x12, 0x34, 0x56, 0x78, 0x90,
  0xAB, 0xCD, 0xEF, 0x12, 0x34, 0x56, 0x78, 0x90
]);

function decryptAES128(encryptedBase64) {
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);
  decipher.setAutoPadding(true); // Asegura uso de PKCS#7

  const decryptedBuffer = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final()
  ]);

  return decryptedBuffer.toString('utf8');
}

module.exports = { decryptAES128 };
