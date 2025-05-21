//Comentar en el servidor
const fetch = require('node-fetch');

// Reemplaza con tu token de bot y tu ID de chat
const TELEGRAM_TOKEN = '7854969368:AAH1WD16zW0VacpMOx0SR5nj864a79AKf4Q';
const CHAT_ID = '5790400043';

async function sendTelegramAlert(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const body = {
    chat_id: CHAT_ID,
    text: message,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.error('Error al enviar la alerta:', response.statusText);
    } else {
      console.log('Alerta enviada por Telegram');
    }
  } catch (error) {
    console.error('Error en la conexión con Telegram:', error);
  }
}

module.exports = { sendTelegramAlert };
