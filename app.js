const createMiddleware = require('./ElementosRed/middleware');
const { startLoadBalancer } = require('./ElementosRed/balanceador');
const { startBroker } = require('./ElementosRed/broker');
const { createPersistenceMiddleware } = require('./ElementosRed/persistencia');

// Inicia el broker
startBroker();

// Inicia los middleware productores
createMiddleware(3000);
createMiddleware(3001);

// Inicia el balanceador
startLoadBalancer();

// Inicia el middleware de persistencia (sin puerto)
createPersistenceMiddleware();
