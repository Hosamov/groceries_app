const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Item = new Schema( {
  item_name: String,
  item_type: String
});

Item.plugin(passportLocalMongoose);

module.exports = mongoose.model('Item', Item);