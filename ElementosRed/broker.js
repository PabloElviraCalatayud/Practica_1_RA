const aedes = require('aedes');
const mqtt = require('mqtt');
const net = require('net');
const chalk = require('chalk');

const mqttPort = 6000;
const broker = aedes();
const server = net.createServer(broker.handle);
const client = mqtt.connect(`mqtt://localhost:${mqttPort}`);

function startBroker() {
  server.listen(mqttPort, () => {
    console.log(chalk.blueBright(`Broker MQTT corriendo en el puerto ${mqttPort}`));
  });

  client.on('connect', () => {
    console.log(chalk.greenBright('Cliente conectado al broker MQTT'));

    client.subscribe('clima', (err) => {
      if (err) {
        console.error(chalk.red('Error al suscribirse al topic "clima":'), err);
      } else {
        console.log(chalk.magentaBright('Suscrito al topic "clima"'));
      }
    });
  });

  client.on('message', (topic, message) => {
    console.log(chalk.cyan(`Mensaje recibido en ${topic}: ${message.toString()}`));
  });

  client.on('error', (err) => {
    console.error(chalk.redBright('Error de conexión MQTT:'), err);
  });
}

module.exports = { startBroker, client };

