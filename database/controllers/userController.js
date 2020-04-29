// database/controllers/userController.js

// load the models
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

// export the User Controller Modules
module.exports = {

  // createUser Module
  createUser: function(req, res) {
    // create the User.findOne filter object using the
    // user email from request body and assign it to userEmail
    var userEmail = { email: req.body.email }

    // Query User and filter for userEmail then call function(error, user) to check
    // if an error occurs or user with userEmail already exist
    User.findOne(userEmail, function(error, user) {

      if (error) {
        // in case of an error finding user end the request and send response
        res.send( { status: 'Error in user query', message: error.message } )

      } else if (user) {
        // if user found end the request and send response
        res.send('User with Email already exist. User can not be created')

      } else {
        // if no user found new user can be created
        // create a new User Object with input from the req.body
        const newUser = new User(req.body)

        // save the newUser with callback function as parameter
        newUser.save(function(error, user) {
          if (error) {
            // in case of an error saving the user end the request and send response
            // user.save() validate input from req.body according to the built-in
            // and custom validations defined in the model and create a validation error
            // in case input validation fail
            res.send( { status: 'User input validation error', message: error.message } )

          } else {
            // end the request and send response
            res.send('User has been successfully added')
          }
        })
      }
    })
  // End createUser Module
  },

  // updateUserEmail Module
  updateUserEmail: function(req, res) {
    // create the User.findOne filter object using the
    // existing user email from request body and assign it to userEmail
    var userEmail = { email: req.body.email }

    // Query User and filter for userEmail then call function(error, user) to check
    // if an error occurs or user with userEmail not exist
    User.findOne(userEmail, function(error, user) {

      if (error) {
        // in case of an error finding user end the request and send response
        res.send( { status: 'Error in user query', message: error.message } )

      } else if (!user) {
        // if no user found end the request and send response
        res.send('No User with this Email. Update not possible')

      } else {
        // in case user found userEmail can be updated
        // assign the new updateEmail from request body to updateUserEmail
        var updateUserEmail = req.body.updateEmail
        // update existing user.email with updateUserEmail
        user.email = updateUserEmail
        // save the updated user with callback function
        user.save(function(error, updatedUser) {
          if (error) {
            // if an error occur end the request and send response
            // user.save() validate new updateUserEmail according to the built-in
            // and custom validations defined in the model and create a validation error
            // in case input validation fail
            res.send( { status: 'User input validation error', message: error.message} )

          } else {
            // update also the author email in all blogs where the updatedUser is author
            // therefore we must get the blog references from the updatedUser and assign these
            // blog references in userBlogRefArr array
            var userBlogRefArr = updatedUser.ref.blogs
            // loop through all user blog references and find the id for each
            // referenced blog
            for (i = 0; i < userBlogRefArr.length; i++) {
              // for each blog reference we must find the blog to update the new author email
              // therefore for each blog reference create the Blog.findOne filter object
              // using the blog reference id and assign it to userBlogRef
              var userBlogRef = { _id: userBlogRefArr[i]._id }
              // Query Blog and filter for userBlogRef then call function(error, blog) to check
              // if an error occurs or blog with userBlogRef not exist
              Blog.findOne(userBlogRef, function(error, blog) {

                if (error) {
                  // in case of an error finding blog end the request and send response
                  res.send( { status: 'Error in blog query. User and Blog Update not possible', message: error.message } )

                } else if (!blog) {
                  // if no blog found log into console.
                  console.log('No Blog found. User update possible. No Blog for blogid: ' +blog._id)

                } else {
                  // change existing blog.author.email value to updateUserEmail
                  blog.author.email = updateUserEmail
                  // save the updated blog with callback function
                  blog.save(function(error, updatedBlog) {
                    if (error) {
                      // if error occur log into console
                      console.log('Error saving update for blogid: ' +updatedBlog._id)

                    } else {
                      // log into console
                      console.log('Update successfull for blogid: ' +updatedBlog._id)
                    }
                  })
                }
              })
            }
            // end the request and send response
            res.send('User successfully updated. New Email: ' +updateUserEmail)
          }
        })
      }
    })
  // End updateUserEmail Module
  },

  // removeUser Module
  removeUser: function(req, res) {
    // create the User.findOne filter object using the
    // user email from request body and assign it to userEmail
    var userEmail = { email: req.body.email }

    // Query User and filter for userEmail then call function(error, user) to check
    // if an error occurs or user with userEmail not exist
    User.findOne(userEmail, function(error, user) {

      if(error) {
        // in case of an error finding user end the request and send response
        res.send( { status: 'Error in user query', message: error.message } )

      } else if (!user) {
        // if no user found end the request and send response
        res.send('No User with this Email. Remove User not possible')

      } else {
        // if user has been found delete user match userEmail
        User.deleteOne(userEmail, function(error, delUser) {
          if(error) {
            // in case of an error end the request and send response
            res.send( { status: 'User deletion error. User can not be deleted', message: error.message } )

          } else {
            // if user has been found end the request and send response
            res.send('User successfully removed in database')
          }
        })
      }
    })
  // End removeUser Module
  },

// End export the User Controller Modules
}
