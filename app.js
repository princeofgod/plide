const createError = require('http-errors');
const express = require('express');
const path = require('path');
const genid = require('genid');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const logger = require('morgan');
const methodOverride = require('method-override')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const candidateRouter = require('./routes/candidate');
const eventRouter = require('./routes/event');
const groupRouter = require('./routes/group');
const userGroupRouter = require('./routes/userGroup');
const eventNomineeRouter = require('./routes/eventNominee');
const categoryRouter = require('./routes/category');

const hbs = require("express-handlebars");
const passport = require("passport");
const flash = require('connect-flash')

const mongoose = require('mongoose');
const User = require('./model/user');
const { Store } = require('express-session');

const app = express();

// Passport config
require('./config/passport')(passport)

const IN_PROD = process.env.NODE_ENV === 'development'

// registering partials
// handlebars.registerPartial('userMenu',)

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.engine(
  "hbs",
  hbs({
    partialsDir: ["views/partials"],
    extname: ".hbs",
    layoutsDir: "views",
    defaultLayout: "layout"
  })
);

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(methodOverride('_method'));


app.use(session({
  name: /*process.env.SESS_NAME*/ 'minimie',
  keys: /*['key1', 'key2']*/'user_id',
  resave: false,
  saveUninitialized: false,
  secret: "chinchin",
  store: new MongoStore({
     mongooseConnection: mongoose.connection,
     autoRemove: 'native',
     }),
  rolling: true,
  unset: "destroy",
  cookie: {
      maxAge: 1000*60*60*1,
      sameSite: true,
      secure: true,
      httpOnly:true
  }
}));

// passport middleware
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/group', groupRouter);
app.use('/event', eventRouter);
app.use('/eventNominee', eventNomineeRouter);
app.use('/category', categoryRouter);
app.use('/userGroup', userGroupRouter);
app.use('/candidate', candidateRouter);


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


exports.sessionChecker = (req, res, next) => {
  if(req.session.user && req.cookies.user_id){
    res.render('home')
  } else {
    next()
  }
}


module.exports = app;
