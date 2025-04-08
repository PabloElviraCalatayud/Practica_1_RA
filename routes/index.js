var express = require('express');
var router = express.Router();
var fs = require('fs');

// Página principal (opcional)
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Data-Logger' });
});

// Endpoint de grabación (cambia GET por POST)
router.post('/record', function(req, res, next) {
  const now = new Date();
  const logfile_name = __dirname + '/../public/logs/' + req.body.id_nodo + "-" +
    now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + '.csv';

  const content = `${req.body.id_nodo};${now.getTime()};${req.body.temperatura};${req.body.humedad};${req.body.co2};${req.body.volatiles}\r\n`;

  // Verifica si el archivo ya existe
  fs.stat(logfile_name, function(err, stat) {
    if (err == null) {
      // Si el archivo existe, agrega el contenido
      append2file(logfile_name, content);
    } else if (err.code === 'ENOENT') {
      // Si el archivo no existe, crea el archivo con el encabezado
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
