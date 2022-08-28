//jshint esversion:6
"use strict";

require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const session = require('express-session'); // For authorizing login
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
// Initialize DB: (TODO: Reenable line below when it goes live)
// require('./initDB')(); 

// Connect to local db: (TODO: Delete line below when it goes live)
mongoose.connect('mongodb://localhost:27017/groceriesDB', {useNewUrlParser: true, useUnifiedTopology: true});

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

  if (req.isAuthenticated()) {
    User.find({'username': {$eq: req.user.username}}, (err, foundData) => {
      if(!err) {
       console.log('Success!');
      } else {
        console.log(err);
      }
    });
    // Make sure the data has been retrieved, render user-portal:
    setTimeout(() => {
      res.render('user_portal', {user: req.user.username});
    }, 200);  
  } else {
    res.redirect('/login');
  }
});

app.get('/admin_portal', (req, res) => {
  const itemArr = [];
  if (req.isAuthenticated() && isAnAdmin) {
    Item.find({'_id':{$ne: null}}, (err, foundItems) => {
      if(!err) {
        foundItems.forEach(item => 
          itemArr.push(item));
        console.log('Success!');
      } else {
        console.log(err);
      }
    }); 
    // Make sure the data has been retrieved, render user-portal:
    setTimeout(() => {
      res.render('admin_portal', { user: req.user.username, items: itemArr })
    }, 200);
  } else {
    // If the user isn't an admin, redirect to user_portal
    res.redirect('/user_portal');
  }
});


//*****  POST routes *****/
app.post('/register', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const authKey = req.body.authkey;
  let isAnAdmin = (authKey === process.env.ADMINAUTHKEY) ? true : false;

  if((req.body.authkey === process.env.AUTHKEY || req.body.authkey === process.env.ADMINAUTHKEY) 
     && req.body.password === req.body.verify_password) {
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

// /login Post route:
app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  const thisUser = user.username;

  User.findOne({username: thisUser}, (err, foundUser) => {
    if(err) {
      console.log(err);
    } else {
      if(foundUser) {
        if(foundUser.isAdmin) {
          isAnAdmin = true;
        } else {
          isAnAdmin = false;
        }
      } else {
        console.log('User does not exist or incorrect credentials were provided.');
        res.redirect('/login');
      }   
    }
  });

  setTimeout(() => {
    req.login(user, (err) => {
      if(err) {
        console.log(err);
      } else {
        if(isAnAdmin) {
          passport.authenticate("local")(req, res, () => {
            res.redirect('/admin_portal');
          });
        } else {
          passport.authenticate("local")(req, res, () => {
            res.redirect('/user_portal');
          });
        }
      }
    });
  }, 100);
});

// /logout POST route
app.post('/logout', (req, res) => {
  req.logout((err) => { //passport.js method
    if(err) { 
      return next(err); 
    } else {
      console.log('Logout Successful!');
    }
  }); 
  res.redirect('/');
});


//***** Connection *****/
app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000...');
});