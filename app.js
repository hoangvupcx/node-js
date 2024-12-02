var createError     = require('http-errors');
var express         = require('express');
var path            = require('path');
var cookieParser    = require('cookie-parser');
var logger          = require('morgan');
const flash         = require('express-flash-notification');
const session       = require('express-session');
const validator     = require('express-validator');

var expressLayouts  = require('express-ejs-layouts');

const mongoose      = require('mongoose');

const pathConfig    = require('./path');

// Define PATH
global.__base           = __dirname + '/';
global.__app            = __base + pathConfig.folder_app + '/';
global.__path_configs   = __app + pathConfig.folder_configs + '/';
global.__path_helpers   = __app + pathConfig.folder_helpers + '/';
global.__path_routes    = __app + pathConfig.folder_routes + '/';
global.__path_schemas   = __app + pathConfig.folder_schemas + '/';
global.__path_validates = __app + pathConfig.folder_validates + '/';
global.__path_views     = __app + pathConfig.folder_views + '/';

const systemConfig  = require(__path_configs + 'system');
const databaseConfig  = require(__path_configs + 'database');

mongoose.connect(`mongodb+srv://${databaseConfig.username}:${databaseConfig.password}@nodejs.panh9.mongodb.net/${databaseConfig.database}`);


var app = express();

app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));

app.use(flash(app, {
  viewName: __path_views + 'elements/flash'
}));

app.use(validator({
  customValidators: {
    isNotEqual: (value1, value2) => {
      return value1 !== value2;
    }
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', __path_views + 'backend')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Local Variables
app.locals.systemConfig = systemConfig;
// Setup router
app.use(`/${systemConfig.prefixAdmin}`, require(__path_routes + 'backend/index'));
// app.use('/', require('./routes/frontend/index'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render(__path_views + 'pages/error', { title: 'ErrorPage' });
});

module.exports = app;
