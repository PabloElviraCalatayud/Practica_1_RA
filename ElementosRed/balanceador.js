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
    console.log(chalk.cyan(`[Balancer] Proxying request to ${target}${req.url}`));
    current = (current + 1) % servers.length;

    proxy.web(req, res, { target }, (err) => {
      console.error(chalk.redBright(`Error proxying request to ${target}: ${err.message}`));
      res.status(500).send('Proxy error');
    });
  });

  app.listen(5000, () => {
    console.log(chalk.blueBright('Load balancer running on port 5000'));
  });
}

module.exports = { startLoadBalancer };
