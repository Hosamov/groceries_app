const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Account = new Schema({
  username: String, // is an email address
  password: String,
  first_name: String,
  last_name: String,
  role: String, //null, user, supervisor, admin
  active: Boolean,
  loggedIn: Boolean, // track logged in status
  lastLoggedIn: String, 
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);