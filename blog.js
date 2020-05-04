// blog.js

// load node http module
const http = require('http')

// load third party Express module
const express = require('express')
const app = express()

// load local modules
const logger = require('./modules/logger');

// start MongoDB Server
const startMongoDbServer = require('./database/db');
startMongoDbServer();

// load database controllers
const userController = require('./database/controllers/userController');
const blogController = require('./database/controllers/blogController');

// middleware
// body parser parse json
app.use(express.json())
// body parser parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))
// use logger module
app.use(logger);

// define routes (routing table)
app.get('/', (req, res) => {
  res.send('Hello, this is the Blog Home Page.')
})

app.get('/about', (req, res) => {
  res.send('Hello, this is the Blog About Page.')
})

app.post('/createusers', userController.createUser)

app.post('/updateuseremail', userController.updateUserEmail)

app.post('/removeusers', userController.removeUser)

app.post('/createblogs', blogController.createBlog)

app.post('/removeblogs', blogController.removeBlog)

app.get('/blogs/:year?/:month?/:day?',

        (req, res, next) => {
          url = req.url
          year = req.params.year
          month = req.params.month
          day = req.params.day

          next()
        },

        blogController.returnAllBlogs,
        blogController.returnYearBlogs,
        blogController.returnMonthBlogs,
        blogController.returnDateBlogs
      )

// default route error handler. matches all routes and all methods
app.use((req, res, next) => {
 res.status(404).send({
 code: 404,
 status: 'Not found',
 message: 'Requested route not found'
 })
})

// default server error handler
app.use((error, req, res, next) => {
 res.status(500).send({
   code: 500,
   status: 'Internal Server Error',
   message: error.message
 });
})

// create the express http server
const server = http.createServer(app);

// server listen for any incoming requests
server.listen(3000);

console.log( { status: "express server start successful", message: "express server successfully started at port 3000" } )
