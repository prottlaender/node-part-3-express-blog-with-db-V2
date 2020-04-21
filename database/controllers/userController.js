// database/controllers/userController.js

// load the user model
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

// export the User Controller Modules
module.exports = {

  // createUser Module
  createUser: function(req, res) {
    // create the User.findOne filter object using the
    // user email from request body and assign it to userEmail
    var userEmail = { email: req.body.email }

    // Query User and filter for userEmail then call function(user) to check
    // if a user with userEmail already exist
    User.findOne(userEmail).then(function(user) {

      if (!user) {
        // if no user found new user can be added
        // create a new User Object with input from the req.body
        const newUser = new User(req.body)
        // save the newUser
        newUser.save((error) => {
          if (error) {
            // In case of an error in input validation end the request and send response
            res.send( { status: 'User validation error', message: error.message } )

          } else {
            // end the request and send response
            res.send('User has been successfully added')
          }
        })

      } else {
        // if user found end the request and send response
        res.send('User with Email already exist. User can not be added')
      }
    })
  // End createUser Module
  },

  // updateUserEmail Module
  updateUserEmail: function(req, res) {
    // create the User.findOne filter object using the
    // existing user email from request body and assign it to userEmail
    var userEmail = { email: req.body.email }

    // Assign the update email from request body to updateUserEmail
    var updateUserEmail = req.body.updateEmail

    // Query User and filter for userEmail then call function(user) to update
    // the found user object
    User.findOne(userEmail).then(function(user) {

      if (!user) {
        // if no user found end the request and send response
        res.send('No User with this Email. Update not possible')

      } else {
        // change existing user.email value to updateUserEmail
        user.email = updateUserEmail
        // save and update user.email value
        user.save((error) => {
          if (error) {
            // if an error occur and input validation fail end the request and send response
            res.send( { status: 'User validation error', message: error.message} )

          } else {
            // assign the user blog references blogs array to userBlogRefArr
            var userBlogRefArr = user.ref.blogs
            // loop through all user blog references
            for (i = 0; i < userBlogRefArr.length; i++) {
              // for each blog reference create the Blog.findOne filter object
              // using the blog reference id and assign it to userBlogRef
              var userBlogRef = { _id: userBlogRefArr[i]._id }
              // Query Blog and filter for userBlogRef then call function(blog) to update
              // the found blog object
              Blog.findOne(userBlogRef).then(function(blog) {
                if (!blog) {
                  // if no blog found end the request and send response
                  console.log('No blog found. Update not possible for blogid: ' +blog._id)

                } else {
                  // change existing blog.author.email value to updateUserEmail
                  blog.author.email = updateUserEmail
                  // save and update blog.author.email new value
                  blog.save((error) => {
                    if (error) {
                      // if error occur log into console
                      console.log('Error saving update for blogid: ' +blog._id)

                    } else {
                      // log into console
                      console.log('Update successfull for blogid: ' +blog._id)
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
    
    // Query User and filter for userEmail then call function(user) to remove
    // the found user object
    User.findOne(userEmail).then(function(user) {
      if (!user) {
        // if no user found end the request and send response
        res.send('No User with this Email. Removal of user not possible')

      } else {
        // if user has been found delete user match userEmail
        User.deleteOne(userEmail, function(error) {
          if (error) {
            // In case of an error end the request and send response
            res.send( { status: 'User deletion error', message: error.message } )
          } else {
            // if user has been found in database end the request and send response
            res.send('User successfully removed in database')
          }
        })
      }
    })
  // End removeUser Module
  },

// End export the User Controller Modules
}
