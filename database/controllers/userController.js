// database/controllers/userController.js

// load the models
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

// export the User Controller Modules
module.exports = {

  // createUser Module
  createUser: function(req, res, next) {

    // assign input data from request body to input variables
    const name = req.body.name
    const lastname = req.body.lastname
    const email = req.body.email

    // create a new User Object with input from the req.body
    const newUser = new User({
      name: name,
      lastname: lastname,
      email: email,
    })

    // try to find a user by email and catch default error in case query fail
    try {
      User.findOne({ email: email }, async function(error, user) {
       if (user) {
          // if user already exist end request and send response
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'User already exist. Create User not possible' })

        } else {
          // if user not exist save new user
          newUser.save(function(err, user) {
            if (err) {
              // if a validation err occur end request and send response
              res.status(400).send({ code: 400, status: 'Bad Request', message: err.message })
            } else {
              res.status(200).send({ code: 200, status: 'Ok', message: 'User successfully created', data: user })
            }
          })
        }
      })
    } catch (error) {
      next(error)
    }
  // End createUser Module
  },

  // updateUserEmail Module
  updateUserEmail: function(req, res, next) {
    // assign input data from request body to input variables
    const email = req.body.email
    const updateEmail = req.body.updateEmail

    // try to find a user by email and catch default error in case query fail
    try {
      User.findOne({ email: email }, function(error, user) {
        if (!user) {
            // if no user found end request and send response
            res.status(400).send({ code: 400, status: 'Bad Request', message: 'User not found. Update User not possible' })

        } else {
            // if user exist update user emeil with updateEmail and save user
            user.email = updateEmail
            user.save(function(err, up_user) {
              if (err) {
              // if validation err occur end request and send response
              res.status(400).send({ code: 400, status: 'Bad Request', message: err.message })

              } else {
                // try to find a blog by the author email and catch default error in case query fail
                try {
                  Blog.find({ "author.email": email }, function(err, blogs) {
                    if (blogs.length == 0) {
                      // if no blog has been found end request and send response
                      res.status(200).send({ code: 200, status: 'Ok', message: 'User update successful. No Blogs found', data: up_user })

                    } else {
                      // try to update all blogs where author email is equal to email with updateEmail
                      // and catch default error in case query fail
                      try {
                        Blog.updateMany({ "author.email": email }, { "author.email": updateEmail }, function(err, result) {
                          res.status(200).send({ code: 200, status: 'Ok', message: 'User and Blogs update successful', data: up_user })
                        })
                      } catch (err) {
                        res.status(502).send({ code: 502, status: 'Bad Gateway', message: 'User update successful but Blog update failed: ' +err.message })
                      }
                    }
                  })
                } catch (err) {
                  res.status(502).send({ code: 502, status: 'Bad Gateway', message: 'User update successful but Blog update failed: ' +err.message })
                }
              }
            })
          }
      })
    } catch (error) {
      next(error)
    }


  // End updateUserEmail Module
  },

  // removeUser Module
  removeUser: function(req, res, next) {
    // assign input data from request body to input variables
    const email = req.body.email

    // try to find a user by email and catch default error in case query fail
    try {
      User.findOne({ email: email }, function(error, user) {
        if (!user) {
          // if no user found end the request and send response
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'No User with this Email. Remove User not possible' })

        } else {
          // if user has been found delete user match email
          try {
            User.deleteOne({ email: email }, function(error, result) {
                res.status(200).send({ code: 200, status: 'Ok', message: 'User removed successfully', data: user })
            })
          } catch (error) {
            next(error)
          }
        }
      })
    } catch (error) {
      next(error)
    }
  // End removeUser Module
  },

// End export the User Controller Modules
}
