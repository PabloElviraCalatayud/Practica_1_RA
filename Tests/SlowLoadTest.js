const axios = require('axios');

const numRequests = 100;           // Número total de peticiones a enviar
const intervalMs = 1000;           // Intervalo entre peticiones en milisegundos (2000 ms = 2s)
let sentRequests = 0;              // Contador de peticiones enviadas

// Función para generar datos aleatorios para el POST
function generateRandomData() {
  return {
    id_nodo: `Nav${Math.floor(Math.random() * 10) + 1}`,
    temperatura: Math.floor(Math.random() * 35) + 15,
    humedad: Math.floor(Math.random() * 50) + 30,
    co2: Math.floor(Math.random() * 500) + 200,
    volatiles: Math.floor(Math.random() * 10) + 1
  };
}

// Función para enviar una solicitud POST
function sendPostRequest() {
  const data = generateRandomData();

  axios.post('http://localhost:5000/record', data, {
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
    clearInterval(intervalId); // Detiene el envío una vez se alcanza el número deseado
  }
}

// Intervalo que envía una petición cada X milisegundos
const intervalId = setInterval(sendPostRequest, intervalMs);
