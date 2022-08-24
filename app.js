
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



app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000...');
});