// loadBalancer.js
const httpProxy = require('http-proxy');
const express = require('express');
const chalk = require('chalk');

function startLoadBalancer() {
  const app = express();
  const proxy = httpProxy.createProxyServer({});
  const servers = ['http://localhost:3000', 'http://localhost:3001'];
  let current = 0;

  app.use((req, res) => {
    const target = servers[current];
    console.log(chalk.cyan(`[Balancer] Redirigiendo petición a ${target}${req.url}`));
    current = (current + 1) % servers.length;

    proxy.web(req, res, { target }, (err) => {
      console.error(chalk.redBright(`Error al redirigir a ${target}: ${err.message}`));
      res.status(500).send('Error del balanceador');
    });
  });

  app.listen(4000, () => {
    console.log(chalk.blueBright('Balanceador de carga escuchando en el puerto 4000'));
  });
}

module.exports = { startLoadBalancer };
