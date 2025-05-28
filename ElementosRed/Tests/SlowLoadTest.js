const axios = require('axios');
const crypto = require('crypto');

const numRequests = 100;
const intervalMs = 1000;
let sentRequests = 0;

// Clave e IV AES-128-CBC (deben coincidir con el middleware)
const aesKey = Buffer.from('1234567890abcdef', 'utf8');      // 16 bytes
const iv = Buffer.from('abcdef1234567890', 'utf8');          // 16 bytes

function generateRandomData() {
  return {
    id_nodo: `Nav${Math.floor(Math.random() * 10) + 1}`,
    temperatura: Math.floor(Math.random() * 35) + 15,
    humedad: Math.floor(Math.random() * 50) + 30,
    co2: Math.floor(Math.random() * 500) + 200,
    volatiles: Math.floor(Math.random() * 50) + 1
  };
}

function encryptAES128(jsonString) {
  try {
    const cipher = crypto.createCipheriv('aes-128-cbc', aesKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(jsonString, 'utf8'),
      cipher.final()
    ]);
    return encrypted.toString('base64');
  } catch (err) {
    console.error('Error cifrando con AES-128:', err.message);
    return null;
  }
}

function sendPostRequest() {
  const originalData = generateRandomData();
  const jsonData = JSON.stringify(originalData);
  const encryptedBase64 = encryptAES128(jsonData);

  if (!encryptedBase64) {
    console.error('Error: no se pudo cifrar el contenido.');
    return;
  }

  axios.post('http://localhost:4000/record', { data: encryptedBase64 }, {
    headers: { 'Content-Type': 'application/json' }
  })
    .then((response) => {
      console.log(`POST ${sentRequests + 1}/${numRequests} exitoso:`, response.status);
    })
    .catch((error) => {
      if (error.response) {
        console.error(`Error en POST (${sentRequests + 1}/${numRequests}):`, error.response.status, error.response.data);
      } else {
        console.error(`Error en POST (${sentRequests + 1}/${numRequests}):`, error.message);
      }
    });

  sentRequests++;
  if (sentRequests >= numRequests) {
    clearInterval(intervalId);
  }
}

const intervalId = setInterval(sendPostRequest, intervalMs);

