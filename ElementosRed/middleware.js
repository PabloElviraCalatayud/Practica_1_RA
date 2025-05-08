const express = require('express');
const { client } = require('./broker');  // Importa el cliente MQTT del broker
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');  // Importa chalk para agregar color a los logs
const { sendTelegramAlert } = require('./telegram');  // Importamos la función para enviar alertas por Telegram

// Definir los umbrales
const thresholds = {
  temperatura: { min: 15, max: 30 },
  humedad: { min: 30, max: 70 },
  co2: { min: 300, max: 1000 },
  volatiles: { min: 10, max: 50 }
};

function createMiddleware(port) {
  const app = express();
  app.use(express.json());  // Para procesar los datos JSON

  // Ruta para recibir y manejar el POST
  app.post('/record', (req, res) => {
    const { id_nodo, temperatura, humedad, co2, volatiles } = req.body;

    // Verificar si los valores están dentro de los baremos
    const alertas = verificarBaremos({ temperatura, humedad, co2, volatiles });

    if (alertas.length > 0) {
      // Si hay alertas, enviarlas por Telegram
      alertas.forEach(alerta => sendTelegramAlert(alerta));
    }

    // Publicar en los topics MQTT
    publishClima({ id_nodo, temperatura, humedad });
    publishGases({ id_nodo, co2, volatiles });

    // Responder al cliente
    res.status(200).json({ status: 'Datos publicados en MQTT (clima y gases)', alertas });
  });

  // Ruta para servir el archivo WADL
  app.get('/wadl', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'api.wadl'));
  });

  // Arrancar el servidor
  const PORT = port || 5000;
  app.listen(PORT, () => {
    console.log(chalk.blueBright(`Middleware corriendo en el puerto ${PORT}`));
  });
}

// Función para verificar si los valores exceden los umbrales
function verificarBaremos(datos) {
  const alertas = [];

  // Comparar cada valor con su umbral
  if (datos.temperatura < thresholds.temperatura.min || datos.temperatura > thresholds.temperatura.max) {
    alertas.push(`Alerta: Temperatura fuera de rango: ${datos.temperatura}°C`);
  }
  if (datos.humedad < thresholds.humedad.min || datos.humedad > thresholds.humedad.max) {
    alertas.push(`Alerta: Humedad fuera de rango: ${datos.humedad}%`);
  }
  if (datos.co2 < thresholds.co2.min || datos.co2 > thresholds.co2.max) {
    alertas.push(`Alerta: CO2 fuera de rango: ${datos.co2}ppm`);
  }
  if (datos.volatiles < thresholds.volatiles.min || datos.volatiles > thresholds.volatiles.max) {
    alertas.push(`Alerta: Volátiles fuera de rango: ${datos.volatiles}`);
  }

  return alertas;
}

// Función para publicar en el topic "clima"
function publishClima(data) {
  const { id_nodo, temperatura, humedad } = data;
  const payload = JSON.stringify({ id_nodo, temperatura, humedad });

  // Publicar el mensaje en el broker
  client.publish('clima', payload, (err) => {
    if (err) {
      console.error(chalk.redBright(`Error al publicar en el topic 'clima':`), err);
    } else {
      console.log(chalk.greenBright(`Datos publicados en 'clima': ${payload}`));
    }
  });
}

// Función para publicar en el topic "gases"
function publishGases(data) {
  const { id_nodo, co2, volatiles } = data;
  const payload = JSON.stringify({ id_nodo, co2, volatiles });

  // Publicar el mensaje en el broker
  client.publish('gases', payload, (err) => {
    if (err) {
      console.error(chalk.redBright(`Error al publicar en el topic 'gases':`), err);
    } else {
      console.log(chalk.greenBright(`Datos publicados en 'gases': ${payload}`));
    }
  });
}

module.exports = createMiddleware;
