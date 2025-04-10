const axios = require('axios');

// Número de solicitudes a enviar
const numRequests = 100; // Puedes cambiar este número a lo que necesites

// Función para generar datos aleatorios para el POST
function generateRandomData() {
  return {
    id_nodo: `Nav${Math.floor(Math.random() * 10) + 1}`, // Ejemplo: Nav1, Nav2, ..., Nav10
    temperatura: Math.floor(Math.random() * 35) + 15,  // Rango de temperatura: 15-50 grados
    humedad: Math.floor(Math.random() * 50) + 30,      // Rango de humedad: 30-80%
    co2: Math.floor(Math.random() * 500) + 200,        // Rango de CO2: 200-700 ppm
    volatiles: Math.floor(Math.random() * 10) + 1       // Rango de compuestos volátiles: 1-10
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
