// database/models/userModel.js

//load the mongoose module
var mongoose = require('mongoose');

//define the User Schema
var Schema = mongoose.Schema;

var userSchema = new Schema({

  // define the auto datafields
  _id: {
    type: Schema.ObjectId,
    auto: true
  },

  _created: {
    type: Date,
    default: Date.now()
  },

  // define the input datafields
  name: {
    type: String,
    required: true,
    // input string validation function
    // input sting must match regex criteria
    validate: function(name) {
      return /^[a-zA-Z0-9üÜäÄöÖ.’-]+$/.test(name)
    }
  },

  lastname: {
    type: String,
    required: true,
    validate: function(lastname) {
      return /^[a-zA-Z0-9üÜäÄöÖ.’-]+$/.test(lastname)
    }
  },

  email: {
    type: String,
    required: true,
    validate: function(email) {
      return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9-]{2,10}$/.test(email)
    }
  },

  // define the reference datafields
  ref: {
    blogs: [{
      _id: {
        type: String
      }
    }]
  },

});

// compile the model from Schema
var User = mongoose.model('col_user', userSchema);

module.exports = User
