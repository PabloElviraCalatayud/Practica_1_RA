const axios = require('axios');

const numRequests = 100;

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
    console.log('POST exitoso:', response.status);
  })
  .catch((error) => {
    console.error('Error en POST:', error.message);
  });
}

// Enviar múltiples solicitudes POST
for (let i = 0; i < numRequests; i++) {
  sendPostRequest();
}
