const chalk = require('chalk');
const createMiddleware = require('./middleware.js');
const httpProxy = require('http-proxy');
const express = require('express');

// Iniciar los middleware en los puertos 3000 y 3001
createMiddleware(3000);
createMiddleware(3001);

// Crear el balanceador de carga en el puerto 5000
const app = express();
const proxy = httpProxy.createProxyServer({});
const servers = ['http://localhost:3000', 'http://localhost:3001'];
let current = 0;

// Middleware de balanceo de carga
app.use((req, res) => {
  const target = servers[current];
  console.log(chalk.red('[Balancer]'), chalk.yellow(`Proxying request to ${target}${req.url}`));
  current = (current + 1) % servers.length;

  proxy.web(req, res, { target }, (err) => {
    console.error(chalk.red('[Balancer Error]'), `Error proxying request to ${target}:`, err);
    res.status(500).send('Proxy error');
  });
});

app.listen(5000, () => {
  console.log(chalk.red('[Balancer]'), chalk.yellow('Load balancer running on port 5000'));
});
