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

    try {
      // try to find a user by email and catch error in case query fail
      User.findOne({ email: email }, function(error, user) {
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
      // if user query fail call default error function
      next(error)
    }
  // End createUser Module
  },

  // updateUserEmail Module
  updateUserEmail: function(req, res, next) {
    // assign input data from request body to input variables
    const email = req.body.email
    const updateEmail = req.body.updateEmail

    try {
      // try to find a user by email and catch error in case query fail
      User.findOne({ email: email }, function(error, user) {
       if (!user) {
          // if no user found end request and send response
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'User not found. Update User not possible' })

        } else {
            // if user exist update user email with updateEmail and save user
            user.email = updateEmail
            user.save(function(err, up_user) {
              if (err) {
              // if validation err occur end request and send response
              res.status(400).send({ code: 400, status: 'Bad Request', message: err.message })

              } else {
                  // try to update the author email with updateEmail on the blog objects
                  // where the user is author and catch err in case update fail
                  try {
                    Blog.updateMany({ "author.email": email }, { "author.email": updateEmail }, function(err, result) {
                      if (result.n == 0) {
                          // if result show no items {n: 0, nModified: 0, ok: 0} end request and send response
                         res.status(200).send({ code: 200, status: 'Ok', message: 'User email update successful. No Blog Found to update author email', data: up_user })
                       } else {
                         // if result show items (example result object: {n: 2, nModified: 2, ok: 2}) to update author email successful end request and send response
                         res.status(200).send({ code: 200, status: 'Ok', message: 'User email and Blogs author email update successful', data: up_user })
                       }
                    })
                  } catch (err) {
                    // if the blog author email update failed user must be restored
                    user.email = email
                    user.save(function(error, restored_user) {
                      if (error) {
                        // it is practically not possible that a validation error occur saving the withdrawn_user but we manage this error
                        // we have a fatal internal server error and data inconsistency
                        res.status(500).send({ code: 500, status: 'Internal Server Error', message_text: 'Blog author email update failed (err) and user could not be restored (error)', message_err: err.message, message_error: error.message })
                      } else {
                        // user restored successfully. No changes on the user email and blog author email
                        res.status(200).send({ code: 200, status: 'Ok', message: 'User restored because Blog author email update failed', message_err: err.message, data: restored_user })
                      }
                    })
                  }
              }
            })
          }
      })

    } catch (error) {
      // if user query fail call default error function
      next(error)
    }
  // End updateUserEmail Module
  },

  // removeUser Module
  removeUser: function(req, res, next) {
    // assign input data from request body to input variables
    const email = req.body.email
    try {
      // try to delete one user and catch error in case deletion fail
      User.deleteOne({ email: email }, function(error, result) {
        if (result.n == 0) {
          // if result show no item to delete {n: 0, nModified: 0, ok: 0} end request and send response
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'No User with this Email. Remove User not possible' })

        } else {
          // if result show item to delete {n: 1, nModified: 1, ok: 1} end request and send response
          res.status(200).send({ code: 200, status: 'Ok', message: 'User removed successfully' })
        }
      })

    } catch (error) {
      // if user deletion fail call default error function
      next(error)
    }
  // End removeUser Module
  },

// End export the User Controller Modules
}
