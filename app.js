
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const session = require('express-session'); // For authorizing login
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
// Initialize DB:
require('./initDB')(); 

app.set('view engine', 'pug');

app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); // Setup Passport to start using it for authentication
app.use(passport.session()); // Use passport to deal with sessions

const UserSchema = new Schema( {
  username: { type: String, default: 'Unknown' },
  password: String,
  email: String,
  isAdmin: Boolean,
  listItems: Array
});

const ItemSchema = new Schema( {
  type: String,
  item_name: String
});

// Hash & salt passwords, save users into db:
UserSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', UserSchema, 'users');
const Item = new mongoose.model('Item', ItemSchema, 'items');

let isAnAdmin = false; // Track whether current user is an admin

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Function to redirect to appropriate user portal based on user level:
function redirect(res) {
  if(isAnAdmin) {
    res.redirect('/admin_portal');
  } else {
    res.redirect('/user_portal');
  }
}

//*****  GET routes *****/

app.get("/", (req, res) => {
  res.render('home');
});

app.get('/add_items', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/user_portal', (req, res) => {
  res.render('user_portal');
})

app.get('/admin_portal', (req, res) => {
  res.render('admin_portal');
})


//*****  POST routes *****/
app.post('/register', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const authKey = req.body.authkey;
  let isAnAdmin = (authKey === process.env.ADMINAUTHKEY) ? true : false;

  if((req.body.authkey === process.env.AUTHKEY || req.body.authkey === process.env.ADMINAUTHKEY) && req.body.password === req.body.verify_password) {
     // Use register() method from passport-local-mongoose:
    User.register({username: username}, password, (err, user) => {
      if(err) {
        console.log(err);
        res.redirect('/register');
      } else {
        passport.authenticate('local')(req, res, () => {
          console.log('Registration successful.');
          User.findOne({username: username}, (err, foundUser) => {
            if(err) {
              console.log(err)
            } else {
              foundUser.email = email;
              foundUser.isAdmin = isAnAdmin;
              foundUser.save(() => {
                console.log('New user has been registered...');
                redirect(res);
              });
            }   
          })
        });
      }
    }); 
  } else {
    console.log('Registration failed.');
    res.redirect('/register');
  }
});



app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000...');
});