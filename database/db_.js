//database/db.js

// load the mongoose module
const mongoose = require('mongoose');

// set connection options to avoid deprecation warnings
// for details read https://mongoosejs.com/docs/deprecations.html
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// configure your connection string and assign it to const mongodbpath
const mongodbpath = 'YOUR-DB-USER:YOUR-DB-USER-PASSWD@localhost:27017/YOUR-DB-NAME';

// create the function that to start the mongodb server and assign the
// function to const startMongoDbServer
const startMongoDbServer = async function() {
  try {

    await mongoose.connect(mongodbpath)
    .then(function() {
      console.log( { status: "db connection successful", message: "db connection successfully established" } )
    })
    .catch(function(error) {
      console.log( { status: "db connection error", message: error.message } )
    })

  } catch(error) {
    res.json( { status: "db connection error", message: error.message } )
  }

};

// export the function startMongoDbServer to be used in the application
module.exports = startMongoDbServer;
