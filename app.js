const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const memoryStore = require('memorystore')(session); // used with express-session(?)

require('dotenv').config()

// Passport Config
const Account = require('./models/account');
const { MemoryStore } = require('express-session'); 
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Initialize DB: 
require('./initDB')(); 

const app = express();

//* Routes:
const loginRoute = require('./routes/auth/login.js');
const registerRoute = require('./routes/auth/register.js');
const unauthorizedRoute = require('./routes/auth/unauthorized.js');
const homeRoute = require('./routes/home.js');
//*

app.set('view engine', 'pug');

app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('public'));
app.use(
  session({          
    cookie: {maxAge: 3600000}, // Expire after 1 hour
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//* Filter routes path:

//*

//* Routes
require('./routes')(app);

//* Root(/) GET route
app.get('/', (req, res, next) => {
  res.render('home');
});

//******* ERROR HANDLERS *******//

//* 404 error handler
app.use((req, res, next) => {
  //Create a new the error class object
  const err = new Error();
  err.message = `It appears the page you requested doesn't exist.`;
  err.status = 404;

  // Log out the error code, and stack to the console, including message
  console.log('Error status code: ' + err.status);
  console.log(err.stack);

  // Render the page-not-found template
  res.status(404).render('./errors/page-not-found'); //display a generic 404 page without error stack
});

//* Global error handler
app.use((err, req, res, next) => {
  if (err) {
    if (err.status === 404) {
      res.status(404).render('./errors/page-not-found', { err }); //render the error status with the error 
      console.log(err);
    } else {
      err.message = err.message; //|| "Oops, it looks like something went wrong on the server...";
      res.status(err.status || 500).render('./errors/error', { err }); //display the error status and render the error template w/ error message/object
      console.log('Error status code: ' + err.status);
      console.log(err.stack);
    }
  }
});

//* Server
app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port 3000...');
});
