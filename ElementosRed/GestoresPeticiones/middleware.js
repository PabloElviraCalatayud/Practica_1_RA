const express = require('express');
const path = require('path');
const chalk = require('chalk');
const { client } = require('./broker');
const TokenBucket = require('../ControlAcceso/TokenBucket');
const { decryptAES128 } = require('../Utils/aes'); // ajusta la ruta si es necesario

const bucket = new TokenBucket(1, 3);

function createMiddleware(port) {
  const app = express();
  app.use(express.json());

  app.post('/record', (req, res) => {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Falta campo 'data' cifrado en Base64" });
    }

    // Mostrar el contenido cifrado (Base64)
    console.log(chalk.yellowBright('[Recibido] Payload cifrado (Base64):'), data);

    let jsonString;
    try {
      jsonString = decryptAES128(data);
    } catch (err) {
      console.error(chalk.redBright('Error al descifrar el mensaje AES-128:'), err.message);
      return res.status(400).json({ error: "Error al descifrar el mensaje AES-128" });
    }

    // Mostrar el JSON descifrado
    console.log(chalk.cyanBright('[Descifrado] Contenido JSON:'), jsonString);

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return res.status(400).json({ error: "JSON inválido después del descifrado" });
    }

    const { id_nodo, temperatura, humedad, co2, volatiles } = parsed;

    if (!bucket.tryConsume()) {
      console.error(chalk.redBright('Error: demasiadas solicitudes, no hay tokens disponibles.'));
      return res.status(429).json({ status: 'Too many requests, try again later' });
    }

    publishClima({ id_nodo, temperatura, humedad });
    publishGases({ id_nodo, co2, volatiles });

    res.status(200).json({ status: 'Datos publicados en MQTT (clima y gases)' });
  });

  app.get('/wadl', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'api.wadl'));
  });

  const PORT = port || 4000;
  app.listen(PORT, () => {
    console.log(chalk.blueBright(`Middleware corriendo en el puerto ${PORT}`));
  });
}

function publishClima(data) {
  const { id_nodo, temperatura, humedad } = data;
  const payload = JSON.stringify({ id_nodo, temperatura, humedad });

  client.publish('clima', payload, (err) => {
    if (err) {
      console.error(chalk.redBright(`Error al publicar en el topic 'clima':`), err);
    } else {
      console.log(chalk.greenBright(`Datos publicados en 'clima': ${payload}`));
    }
  });
}

function publishGases(data) {
  const { id_nodo, co2, volatiles } = data;
  const payload = JSON.stringify({ id_nodo, co2, volatiles });

  client.publish('gases', payload, (err) => {
    if (err) {
      console.error(chalk.redBright(`Error al publicar en el topic 'gases':`), err);
    } else {
      console.log(chalk.greenBright(`Datos publicados en 'gases': ${payload}`));
    }
  });
}

module.exports = createMiddleware;

