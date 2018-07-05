const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);

const routes = require('./routes/index');
const userRoutes = require('./routes/user');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(
	'mongodb://localhost:27017/shopping',
	{ useNewUrlParser: true },
);

// passport
require('./config/passport');

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(
	session({
		secret: 'mysupersecret',
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
		cookie: { maxAge: 180 * 60 * 1000 },
	}),
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	res.locals.login = req.isAuthenticated();
	res.locals.session = req.session;
	next();
});

app.use('/user', userRoutes);
app.use('/', routes);

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
	res.render('error');
});

module.exports = app;
