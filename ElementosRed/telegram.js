const fetch = require('node-fetch');

// Reemplaza con tu token de bot y tu ID de chat
const TELEGRAM_TOKEN = '7866004046:AAHJvUb8jUFojuPiEOCpDhz5p2JEeqSTupU';
const CHAT_ID = 'YOUR_CHAT_ID';

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
