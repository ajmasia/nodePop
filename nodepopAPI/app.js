'use strict';

// Require dependences
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var appLib = require('./lib/appLib');

// Requiren controllers
const usersController = require('./controllers/apiv1/userController');
const jstAuth = require('./middlewares/jwtAuth');

// Require database connection
const dbConnect = require('./lib/dbConnect');

// Require models
require('./models/Ad');
require('./models/User');

var app = express();

// App setup
// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

// Uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Static documents middleware
app.use(express.static(path.join(__dirname, 'public')));

// Require and configure express for localization
const i18n = require('./lib/i18nConfig')();
app.use(i18n.init);

/**
 * Web app middelwares
 */
app.use('/', require('./routes/webApp/index'));
app.use('/lang', require('./routes/webApp/lang'));
// app.use('/lang', jstAuth(), require('./routes/webApp/lang'));
// app.use('/', jstAuth(), require('./routes/webApp/index'));

/**
 * API middelwares
 */
app.post('/apiv1/singup', usersController.singUp);
app.post('/apiv1/login', usersController.singIn);
app.delete('/apiv1/users/:id', jstAuth(), usersController.deleteUser);
app.put('/apiv1/users/:id', jstAuth(), usersController.updateUser);
app.get('/apiv1/users', jstAuth(), usersController.usersList);
app.use('/apiv1/ads', jstAuth(), require('./routes/apiv1/ads'));


// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function (err, req, res, next) {

  if (err.array) {
    err.status = 422;
    const errInfo = err.array({
      onlyFirstError: true
    })[0];
    err.message = `Not valid - ${errInfo.param} ${errInfo.msg}`;
  }

  res.status(err.status || 500);

  // Error response if is and API request with JSON format
  if (appLib.isAPI(req)) {
    res.json({
      success: false,
      error: err.message
    });
    return;
  }

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.render('error');
});

module.exports = app;