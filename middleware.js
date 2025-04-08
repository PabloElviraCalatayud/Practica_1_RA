var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var serveIndex = require('serve-index');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

function createMiddleware(port) {
  var app = express();

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.set('port', port); // Esto es clave para mostrar el puerto en las respuestas

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/logs', serveIndex(path.join(__dirname, 'public/logs')));
  app.use('/logs', express.static(path.join(__dirname, 'public/logs')));

  // Logging personalizado para saber cuál middleware responde
  app.use((req, res, next) => {
    console.log(`[Middleware ${port}] Received request: ${req.method} ${req.url}`);
    next();
  });

  app.use('/', indexRouter);
  app.use('/users', usersRouter);

  // Catch 404
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // Error handler
  app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  });

  app.listen(port, () => {
    console.log(`Middleware running on port ${port}`);
  });

  return app;
}

module.exports = createMiddleware;
