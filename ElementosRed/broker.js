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
  });

  client.on('error', (err) => {
    console.error(chalk.redBright('Error de conexión MQTT:'), err);
  });
}

module.exports = { startBroker, client };
