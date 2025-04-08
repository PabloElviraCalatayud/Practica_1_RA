var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

// Ruta del directorio donde se guardarán los archivos de log
const logsDir = path.join(__dirname, '/../public/logs');

// Asegurarse de que el directorio de logs exista, si no, créalo
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Página principal
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Data-Logger' });
});

// Endpoint de grabación con POST
router.post('/record', function(req, res, next) {
  const now = new Date();
  const logfile_name = path.join(logsDir, req.body.id_nodo + "-" +
    now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + '.csv');

  const content = `${req.body.id_nodo};${now.getTime()};${req.body.temperatura};${req.body.humedad};${req.body.co2};${req.body.volatiles}\r\n`;

  fs.stat(logfile_name, function(err, stat) {
    if (err == null) {
      append2file(logfile_name, content);
    } else if (err.code === 'ENOENT') {
      const header = 'id_nodo;timestamp;temperatura;humedad;CO2;volatiles\r\n';
      append2file(logfile_name, header + content);
    } else {
      console.log('Some other error: ', err.code);
    }
  });

  res.send(`Saving: ${content.trim()} in: ${logfile_name}`);
});

// Función de apoyo para guardar en archivo
function append2file(file, content) {
  fs.appendFile(file, content, function(err) {
    if (err) throw err;
    console.log(`[FILE WRITE] ${file} <- ${content.trim()}`);
  });
}

// Endpoint de status para verificar qué puerto responde
router.get('/status', function(req, res) {
  res.send(`OK from middleware at port ${req.app.get('port')}`);
});

module.exports = router;
