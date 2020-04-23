//database/db.js

// load the mongoose module
const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const mongodbpath = 'YOUR-DB-USER:YOUR-DB-USER-PASSWD@localhost:27017/YOUR-DB-NAME';

const startMongoDbServer = async function() {
  try {

    await mongoose.connect(mongodbpath)
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
