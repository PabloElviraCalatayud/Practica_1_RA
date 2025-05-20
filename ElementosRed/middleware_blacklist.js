// ElementosRed/middleware_blacklist.js
const express = require('express');
const httpProxy = require('http-proxy');
const chalk = require('chalk');
const { isBlacklisted } = require('./blacklist');

function startBlacklistMiddleware() {
  const app = express();
  const proxy = httpProxy.createProxyServer({});
  const target = 'http://localhost:4000'; // Puerto del balanceador

  app.use((req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const cleanIP = ip.replace(/^::ffff:/, '');

    if (isBlacklisted(cleanIP)) {
      console.warn(chalk.yellowBright(`[Blacklist] Petición bloqueada desde IP prohibida: ${cleanIP}`));
      return res.status(403).json({ error: 'Acceso denegado desde esta IP' });
    }

    console.log(chalk.greenBright(`[Blacklist] IP autorizada: ${cleanIP}, reenviando a balanceador (${target})`));

    proxy.web(req, res, { target }, (err) => {
      console.error(chalk.redBright(`[Blacklist] Error al reenviar al balanceador: ${err.message}`));
      res.status(500).send('Error interno del proxy de blacklist');
    });
  });

  app.listen(5000, () => {
    console.log(chalk.blueBright('[Blacklist] Middleware de filtrado escuchando en el puerto 5000'));
  });
}

module.exports = { startBlacklistMiddleware };
