//database/db.js

const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

const mongodbpath = '<YOUR CONNECTION PATH>';

const startMongoDbServer = async function() {
  try {

    await mongoose.connect(mongodbpath, { useFindAndModify: false })
    .then(function() {
      console.log(`Mongoose connection open on ${mongodbpath}`);
    })
    .catch(function(error) {
      console.log(`Connection error message: ${error.message}`);
    })

  } catch(error) {
    res.json( { status: "db connection error", message: error.message } );
  }

};

module.exports = startMongoDbServer;
