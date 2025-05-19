const express = require('express');
const path = require('path');
const chalk = require('chalk');
const { client } = require('./broker');
const { sendTelegramAlert } = require('./telegram');
const TokenBucket = require('./TokenBucket');

const thresholds = {
  temperatura: { min: 15, max: 30 },
  humedad: { min: 30, max: 70 },
  co2: { min: 300, max: 1000 },
  volatiles: { min: 10, max: 50 }
};

const bucket = new TokenBucket(1, 3);

function createMiddleware(port) {
  const app = express();
  app.use(express.json());

  app.post('/record', (req, res) => {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Falta campo 'data' con Base64" });
    }

    let jsonString;
    try {
      jsonString = Buffer.from(data, 'base64').toString('utf-8');
    } catch (err) {
      return res.status(400).json({ error: "Error decodificando Base64" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return res.status(400).json({ error: "JSON inválido después de decodificar Base64" });
    }

    const { id_nodo, temperatura, humedad, co2, volatiles } = parsed;

    if (!bucket.tryConsume()) {
      console.error(chalk.redBright('Error: demasiadas solicitudes, no hay tokens disponibles.'));
      return res.status(429).json({ status: 'Too many requests, try again later' });
    }

    // Detectar parámetros fuera de rango
    const parametrosFueraDeRango = verificarBaremos({ temperatura, humedad, co2, volatiles });

    if (parametrosFueraDeRango.length > 0) {
      let mensajeAlerta = `Alerta para nodo ${id_nodo}:\n`;
      mensajeAlerta += `Parámetros recibidos:\n`;
      mensajeAlerta += ` - Temperatura: ${temperatura}°C\n`;
      mensajeAlerta += ` - Humedad: ${humedad}%\n`;
      mensajeAlerta += ` - CO2: ${co2} ppm\n`;
      mensajeAlerta += ` - Volátiles: ${volatiles}\n\n`;
      mensajeAlerta += `Parámetros fuera de rango:\n`;
      parametrosFueraDeRango.forEach(param => {
        mensajeAlerta += ` - ${param}\n`;
      });

      sendTelegramAlert(mensajeAlerta);
    }

    publishClima({ id_nodo, temperatura, humedad });
    publishGases({ id_nodo, co2, volatiles });

    res.status(200).json({ status: 'Datos publicados en MQTT (clima y gases)', alertas: parametrosFueraDeRango });
  });

  app.get('/wadl', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'api.wadl'));
  });

  const PORT = port || 5000;
  app.listen(PORT, () => {
    console.log(chalk.blueBright(`Middleware corriendo en el puerto ${PORT}`));
  });
}

function verificarBaremos(datos) {
  const alertas = [];

  if (datos.temperatura < thresholds.temperatura.min || datos.temperatura > thresholds.temperatura.max) {
    alertas.push(`Temperatura fuera de rango: ${datos.temperatura}°C`);
  }
  if (datos.humedad < thresholds.humedad.min || datos.humedad > thresholds.humedad.max) {
    alertas.push(`Humedad fuera de rango: ${datos.humedad}%`);
  }
  if (datos.co2 < thresholds.co2.min || datos.co2 > thresholds.co2.max) {
    alertas.push(`CO2 fuera de rango: ${datos.co2} ppm`);
  }
  if (datos.volatiles < thresholds.volatiles.min || datos.volatiles > thresholds.volatiles.max) {
    alertas.push(`Volátiles fuera de rango: ${datos.volatiles}`);
  }

  return alertas;
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

