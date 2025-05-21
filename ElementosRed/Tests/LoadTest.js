const axios = require('axios');

const numRequests = 100;
const intervalMs = 100;
let sentRequests = 0;

function generateRandomData() {
  return {
    id_nodo: `Nav${Math.floor(Math.random() * 10) + 1}`,
    temperatura: Math.floor(Math.random() * 35) + 15,
    humedad: Math.floor(Math.random() * 50) + 30,
    co2: Math.floor(Math.random() * 500) + 200,
    volatiles: Math.floor(Math.random() * 50) + 1
  };
}

function sendPostRequest() {
  const originalData = generateRandomData();
  const jsonData = JSON.stringify(originalData);
  const base64Data = Buffer.from(jsonData, 'utf-8').toString('base64');

  axios.post('http://localhost:5000/record', { data: base64Data }, {
    headers: { 'Content-Type': 'application/json' }
  })
  .then((response) => {
    console.log(`POST ${sentRequests}/${numRequests} exitoso:`, response.status);
  })
  .catch((error) => {
    console.error('Error en POST:', error.message);
  });

  sentRequests++;
  if (sentRequests >= numRequests) {
    clearInterval(intervalId);
  }
}

const intervalId = setInterval(sendPostRequest, intervalMs);

