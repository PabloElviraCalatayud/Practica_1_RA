// app.js

const createMiddleware = require('./ElementosRed/middleware');
const { startLoadBalancer } = require('./ElementosRed/balanceador');
const { startBroker } = require('./ElementosRed/broker');


// Inicia el broker MQTT en el puerto 6000
startBroker();  // Inicia el broker MQTT
// Ejecuta los middleware en los puertos 3000 y 3001
createMiddleware(3000);  // Middleware en el puerto 3000
createMiddleware(3001);  // Middleware en el puerto 3001

// Inicia el balanceador de carga
startLoadBalancer();  // Inicia el balanceador


