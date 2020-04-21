// database/models/blogModel.js

// load the mongoose module
var mongoose = require('mongoose');

// define the User Schema
var Schema = mongoose.Schema;

var blogSchema = new Schema({

  // define the auto datafields
  _id: {
    type: Schema.ObjectId,
    auto: true
  },

  _created: {
    type: Date,
    auto: true,
    default: Date.now()
  },

  // define the input datafields
  title: {
    type: String,
    required: true,
    // input string validation function
    // input sting must match regex criteria
    validate: function(title) {
      return /^[a-zA-Z0-9üÜäÄöÖ;,:._+?=(\-)&%$§"!\ ]{5,150}$/.test(title)
    }
  },

  author: {

    firstname: {
      type: String,
      required: true,
      validate: function(firstname) {
        return /^[a-zA-Z0-9üÜäÄöÖ.’-]+$/.test(firstname)
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
    }

  },

  date: {
    type: String,
    required: true,
    validate: function(date) {
      return /^([0-9][0-9][0-9][0-9])-([0][1-9]|[1][0-2])-([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])$/.test(date)
    }
  },

})

// compile the model from Schema
var Blog = mongoose.model('col_blog', blogSchema);

// export the module
module.exports = Blog
