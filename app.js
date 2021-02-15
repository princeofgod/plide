const createError = require('http-errors');
const express = require('express');
const path = require('path');
const {v4: uuid} = require('uuidv4')
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const logger = require('morgan');
const methodOverride = require('method-override')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const candidateRouter = require('./routes/candidate');
const eventRouter = require('./routes/event');
const groupRouter = require('./routes/group');
const userGroupRouter = require('./routes/userGroup');
const eventNomineeRouter = require('./routes/eventNominee');
const courseRouter = require('./routes/course');
const paymentRouter = require('./routes/payment');
const helper = require('./config/helpers')

const Handlebars = require("handlebars");
const hbs = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const passport = require("passport");
// const flash = require('connect-flash')
const MongoDBStore = require('connect-mongodb-session')
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const store = exports = new MongoStore({
  uri: 'mongodb://localhost:27017/MVC1',
  // databaseName:'MVC1',
  collection: 'sessions'
});
Handlebars.registerHelper('for', function(from, to, incr, block) {
  var accum = '';
  for(var i = from; i < to; i += incr)
      accum += block.fn(i);
  return accum;
});
const app = express();

// Passport config
require('./config/passport')(passport)

const IN_PROD = process.env.NODE_ENV === 'development'

app.engine(
  "hbs",
  hbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    partialsDir: ["views/partials"],
    extname: ".hbs",
    layoutsDir: "views",
    defaultLayout: "layout",
    helpers:{
      'loop' : function(from, to, incr, block) {
        var accum = '';
        for(var i = from; i < to +1 ; i += incr)
            accum += block.fn(i);
        return accum;
    },
	'estimate' : function(a, b, opts) {
		if(a > b) return a = b
		else return a = a
  },
  'previous' : function(a, opts) {
    if(a == 1){
      return opts.fn(this)
    } else {
      return opts.inverse(this)
    }
  },
  'next' : function(a,opts){
    if(a == false){
      return opts.fn(this)
    } else {
      return opts.inverse(this)
    }
  },
  }})
);
// Handlebars.registerHelper('paginate', require('handlebars-paginate'));

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'fonts')))
app.use(methodOverride('_method'));


app.use(session({
  genid: (req) => {
    return v4()
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store:store,
  cookie: { 
    secure: false,
    maxAge: 60*60*1000,
    rolling:true
   }
}))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/group', groupRouter);
app.use('/event', eventRouter);
app.use('/eventNominee', eventNomineeRouter);
app.use('/course', courseRouter);
app.use('/userGroup', userGroupRouter);
app.use('/candidate', candidateRouter);
app.use('/payment', paymentRouter);


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
