const mqtt = require('mqtt');
const { sendTelegramAlert } = require('../Servicios/telegram');
const chalk = require('chalk');

function startAlertasSuscriptor() {
  const client = mqtt.connect('mqtt://localhost:6000');

  client.on('connect', () => {
    client.subscribe(['clima', 'gases'], (err) => {
      if (err) {
        console.error(chalk.redBright('Error al suscribirse a los topics:'), err);
      }
    });
  });

  client.on('message', (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const { id_nodo } = data;

      const thresholds = {
        clima: {
          temperatura: { min: 15, max: 30 },
          humedad: { min: 30, max: 70 }
        },
        gases: {
          co2: { min: 300, max: 1000 },
          volatiles: { min: 10, max: 50 }
        }
      };

      let alertas = [];

      if (topic === 'clima') {
        const { temperatura, humedad } = data;
        if (temperatura < thresholds.clima.temperatura.min || temperatura > thresholds.clima.temperatura.max) {
          alertas.push(`Temperatura fuera de rango: ${temperatura}°C`);
        }
        if (humedad < thresholds.clima.humedad.min || humedad > thresholds.clima.humedad.max) {
          alertas.push(`Humedad fuera de rango: ${humedad}%`);
        }
      }

      if (topic === 'gases') {
        const { co2, volatiles } = data;
        if (co2 < thresholds.gases.co2.min || co2 > thresholds.gases.co2.max) {
          alertas.push(`CO2 fuera de rango: ${co2} ppm`);
        }
        if (volatiles < thresholds.gases.volatiles.min || volatiles > thresholds.gases.volatiles.max) {
          alertas.push(`Volátiles fuera de rango: ${volatiles}`);
        }
      }

      if (alertas.length > 0) {
        let mensaje = `Alerta para nodo ${id_nodo}:\n` +
                      `Topic: ${topic}\n\n` +
                      alertas.map(a => ` - ${a}`).join('\n');
        sendTelegramAlert(mensaje);
      }
    } catch (err) {
      console.error(chalk.red('Error procesando mensaje MQTT:'), err);
    }
  });
}

module.exports = { startAlertasSuscriptor };

