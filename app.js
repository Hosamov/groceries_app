
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const session = require('express-session');

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

const UserSchema = new Schema( {
  username: { type: String, default: 'Unknown' },
  password: String,
  email: String,
  isAdmin: Boolean,
  listItems: Array
});


//*  GET routes */
app.get("/", (req, res) => {
  res.send('Hello World!');
});



app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000...');
});