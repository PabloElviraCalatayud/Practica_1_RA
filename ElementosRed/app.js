// app.js
const createMiddleware = require('./GestoresPeticiones/middleware');
const { startLoadBalancer } = require('./ControlAcceso/balanceador');
const { startBroker } = require('./GestoresPeticiones/broker');
const { createPersistenceMiddleware } = require('./Servicios/middleware_persistente');
const { startBlacklistMiddleware } = require('./ControlAcceso/middleware_blacklist');

// Inicia el broker MQTT
startBroker();

// Inicia los middleware productores en los puertos 3000 y 3001
createMiddleware(3000);
createMiddleware(3001);

// Inicia el balanceador de carga en el puerto 4000
startLoadBalancer();

// Inicia el middleware de persistencia (sin puerto asignado)
createPersistenceMiddleware();

// Inicia el middleware de control de acceso por IP en el puerto 5000
startBlacklistMiddleware();
