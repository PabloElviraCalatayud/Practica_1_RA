const express = require('express');
const { client } = require('./broker');  // Importa el cliente MQTT del broker
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');  // Importa chalk para agregar color a los logs

function createMiddleware(port) {
  const app = express();
  app.use(express.json());  // Para procesar los datos JSON

  // Ruta para recibir y manejar el POST
  app.post('/record', (req, res) => {
    const { id_nodo, temperatura, humedad, co2, volatiles } = req.body;

    // Publicar en los topics MQTT
    publishClima({ id_nodo, temperatura, humedad });
    publishGases({ id_nodo, co2, volatiles });

    // Responder al cliente
    res.status(200).json({ status: 'Datos publicados en MQTT (clima y gases)' });
  });

  const PORT = port || 5000;
  if (PORT === 3000 || PORT === 3001) {
    console.log(chalk.yellowBright(`Middleware corriendo en el puerto ${PORT}`)); // Mensaje en amarillo brillante
  } else {
    console.log(chalk.blueBright(`Middleware corriendo en el puerto ${PORT}`)); // Otros puertos en azul brillante
  }

  app.listen(PORT);
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
