// ElementosRed/persistencia.js

const mqtt = require('mqtt');
const mysql = require('mysql2');
const chalk = require('chalk');

function createPersistenceMiddleware() {
  const client = mqtt.connect('mqtt://localhost:6000');

  const db = mysql.createConnection({
    host: 'localhost',
    user: 'user',        // Cambia por tu usuario MySQL
    password: 'safePassword123', // Cambia por tu contraseña
    database: 'datos_sensores'
  });

  db.connect((err) => {
    if (err) {
      console.error(chalk.redBright('Error al conectar con la base de datos:'), err);
    } else {
      console.log(chalk.greenBright('Conectado a la base de datos MySQL'));
    }
  });

  client.on('connect', () => {
    console.log(chalk.blueBright('Middleware de persistencia conectado al broker MQTT'));

    client.subscribe(['clima', 'gases'], (err) => {
      if (err) {
        console.error(chalk.red('Error al suscribirse a los topics:'), err);
      } else {
        console.log(chalk.magentaBright('Suscrito a los topics "clima" y "gases"'));
      }
    });
  });

  client.on('message', (topic, message) => {
    try {
      const data = JSON.parse(message.toString());

      if (topic === 'clima') {
        const { id_nodo, temperatura, humedad } = data;
        db.query(
          'INSERT INTO clima (id_nodo, temperatura, humedad) VALUES (?, ?, ?)',
          [id_nodo, temperatura, humedad],
          (err) => {
            if (err) {
              console.error(chalk.red('Error al insertar en "clima":'), err);
            } else {
              console.log(chalk.green(`Dato insertado en "clima": ${message.toString()}`));
            }
          }
        );
      } else if (topic === 'gases') {
        const { id_nodo, co2, volatiles } = data;
        db.query(
          'INSERT INTO gases (id_nodo, co2, volatiles) VALUES (?, ?, ?)',
          [id_nodo, co2, volatiles],
          (err) => {
            if (err) {
              console.error(chalk.red('Error al insertar en "gases":'), err);
            } else {
              console.log(chalk.green(`Dato insertado en "gases": ${message.toString()}`));
            }
          }
        );
      }
    } catch (e) {
      console.error(chalk.redBright('Error al parsear mensaje MQTT:'), e);
    }
  });
}

module.exports = { createPersistenceMiddleware };
