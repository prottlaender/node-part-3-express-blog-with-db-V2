// database/controllers/userController.js

// load the user and blog models
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

// export the Blog Controller Modules
module.exports = {

  // create Blog Module
  createBlog: function (req, res, next) {
    // assign input data from request body to input variables
    var title = req.body.title
    var authorFirstName = req.body.firstname
    var authorLastName = req.body.lastname
    var authorEmail = req.body.email
    var date = req.body.date

    // create the new Blog Object with input variables
    const newBlog = new Blog({
      title: title,
      "author.firstname": authorFirstName,
      "author.lastname": authorLastName,
      "author.email": authorEmail,
      date: date,
    })

    try {
      // try to find one user by author email and catch error in case query fail
      User.findOne({ email: authorEmail }, function(error, user) {
        if (!user) {
          // if no user found end the request and send response
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'No User for this Author Email. Create Blog not possible' })

        } else if (user.name !== authorFirstName || user.lastname !== authorLastName) {
          // if user found but first- or lastname do not match end the request and send response
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'Author firstname, lastname do not match. Create Blog not possible' })

        } else {
          // if user found and first- and lastname match save the new Blog Object
          newBlog.save(function(err, blog) {
            if (err) {
              // if an input validation err occur end the request and send response
              res.status(400).send({ code: 400, status: 'Bad Request', message: 'Input validation error: ' +err.message })

            } else {
              const blogId = blog._id
              // try to update user blog reference on user object and catch err in case user update fail
              try {
                // update the blog reference on the author user object using the $push operator
                User.updateOne( { email: authorEmail }, { $push: { 'ref.blogs': [{ _id: blogId }] } }, function(err, result) {
                  res.status(200).send({ code: 200, status: 'Ok', message: 'Blog successfully created and User blog reference updated', blogid: blogId })
                })

              } catch (err) {
                // if the update of the user blog reference on the user object fail the blog creation must be withdrawn
                // therefore the blog just created will be deleted again
                // try to delete the new breated blog with blogId and catch error in case blog deletion fail
                try {
                  Blog.deleteOne( { _id: blogId }, function (error, result) {
                    // new blog successfully deleted again
                    res.status(200).send({ code: 200, status: 'Ok', message: 'Update User blog reference failed (err). New Blog could be deleted again', message_err: err.message })
                  })
                } catch (error) {
                  // blog deletion failed and we end the request and send response
                  // we have an internal server error and data inconsistency. new blog has been saved but the author has no blog reference
                  res.status(500).send({ code: 500, status: 'Internal Server Error', message_text: 'Update User blog reference failed (err) and new Blog deletion failed (error)', message_err: err.message, message_error: error.message })
                }
              }
            }
          })
        }
      })
    } catch (error) {
      // if user query fail call default error function
      next(error)
    }
  // End create Blog Module
  },

  // removeBlog Module
  removeBlog: function(req, res, next) {

    const title = req.body.title
    try {
      // try to find one blog by title that should be removed and catch error when query fail
      Blog.findOne({ title: title }, function(error, blog) {
        if (!blog) {
          // if no blog found end the request and send response
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'No Blog with this Title. Blog Removal not possible' })

        } else {
          const blogId = blog._id
          const authorEmail = blog.author.email

          try {
            // if blog has been found try to delete blog with blogId and
            // catch error when deletion fail
            Blog.deleteOne( { _id: blogId }, function(error, result) {

              try {
                  // try to remove the blog reference on the author user object using the $pull operator
                  // and catch err in case update user object fail
                  User.updateOne({ email: authorEmail }, { $pull: { 'ref.blogs': { _id: blog._id } } }, function(err, result) {
                    if (result.n == 0) {
                      // in case no items have been updated {n: 0, nModified: 0, ok: 0} end request and send response
                      res.status(200).send({ code: 200, status: 'Ok', message: 'Blog removed. No User found to update User blog reference' })
                    } else {
                      // in case items have been updated {n: 1, nModified: 1, ok: 1} end request and send response
                      res.status(200).send({ code: 200, status: 'Ok', message: 'Blog removed. User blog reference successfully updated' })
                    }
                  })

              } catch (err) {
                // in case remove of the blog reference on the user object fail
                // previously deleted blog must be restored
                blog.save(function(error, withdrawn_blog) {
                  if (error) {
                    // it is practically not possible that a validation error occur saving the removed blog
                    // but we manage this error. we have a fatal server error and data inconsistency
                    res.status(500).send({ code: 500, status: 'Internal Server Error', message_text: 'Blog removed. User blog reference update failed (err). Restore blog failed (error)', message_err: err.message, message_error: error.message })

                  } else {
                    // previously deleted blog has been restored
                    res.status(200).send( { code: 200, status: 'Ok', message: 'Blog restored successfully. User blog reference update failed (err): ' +err.message } )
                  }
                })
              }
            })

          } catch (error) {
            // if blog deletion fail call default error function
            next(error)
          }
        }
      })

    } catch (error) {
      // if find blog fail call default error function
      next(error)
    }
  // End removeBlog Module
  },

  // returnAllBlogs Module
  returnAllBlogs: function(req, res, next) {

    if (url == '/blogs') {
      // try to find all Blog Objects and catch default error if it does not work
      try {
        Blog.find({}, function(error, blogs) {

          if (blogs.length == 0) {
            // in case no blog found end the request and send response
            res.status(200).send({ code: 200, status: 'Ok', message: 'No blogs found' })

          } else {
            // define an empty allBlogs array
            var allBlogs = []
            // loop through the blogs array
            for (i = 0; i < blogs.length; i++) {
              // define a dataset object for each item in blogs array
              var dataset = {
                title: blogs[i].title,
                author: blogs[i].author,
                date: blogs[i].date
              }
              // push each dataset object into allBlogs array
              allBlogs.push(dataset)
            }
            // end the request and send allBlogs response
            res.status(200).send({ code: 200, status: 'Ok', message: 'Blogs found', data: allBlogs })
          }
        })
      // catch error in case Blog.find fail and invoke default error handler
      } catch (error) {
        next(error)
      }
    } else {
      next()
    }
  // End returnAllBlogs Module
  },

  // returnYearBlogs Module
  returnYearBlogs: function(req, res, next) {

    if (url == '/blogs'+'/'+year) {

      // define search criteria for Blog.find()
      // $gte: value greater or equal
      // $lte: value lower or equal
      var gte = year+'-'+'01-01'
      var lte = year+'-'+'12-31'
      var timeQuery = { date: {$gte: gte, $lte: lte} }

      try {

        Blog.find(timeQuery, function(error, blogs) {

          if (blogs.length == 0) {
            res.status(200).send({ code: 200, status: 'Ok', message: 'No Blogs found for this year', year: year })

          } else {
            var yearBlogs = []
            for (i = 0; i < blogs.length; i++) {
              var dataset = {
                title: blogs[i].title,
                author: blogs[i].author,
                date: blogs[i].date
              }
              yearBlogs.push(dataset)
            }
            res.status(200).send({ code: 200, status: 'Ok', message: 'Blogs found for this year', year: year, data: yearBlogs })
          }
        })
      } catch (error) {
        next(error)
      }
    } else {
      next()
    }
  // End returnYearBlogs Module
  },

  // returnMonthBlogs Module
  returnMonthBlogs: function(req, res, next) {

    if (url == '/blogs'+'/'+year+'/'+month) {

      var gte = year+'-'+month+'-'+'01'
      var lte = year+'-'+month+'-'+'31'
      var timeQuery = { date: {$gte: gte, $lte: lte} }

      try {

        Blog.find(timeQuery, function(error, blogs) {

         if (blogs.length == 0) {
            res.status(200).send({ code: 200, status: 'Ok', message: 'No Blogs found for this year and month', year: year, month: month })

          } else {
            var yearMonthBlogs = []
            for (i = 0; i < blogs.length; i++) {
              var dataset = {
                title: blogs[i].title,
                author: blogs[i].author,
                date: blogs[i].date
              }
              yearMonthBlogs.push(dataset)
            }
            res.status(200).send({ code: 200, status: 'Ok', message: 'Blogs found for this year and month', year: year, month: month, data: yearMonthBlogs })
          }
        })

      } catch (error) {
        next(error)
      }
    } else {
      next()
    }
  // End returnMonthBlogs Module
  },

  // returnDateBlogs Module
  returnDateBlogs: function(req, res, next) {

      var gte = year+'-'+month+'-'+day
      var lte = year+'-'+month+'-'+day
      var timeQuery = { date: {$gte: gte, $lte: lte} }

      try {

        Blog.find(timeQuery, function(error, blogs) {
          if (blogs.length == 0) {
            res.status(200).send({ code: 200, status: 'Ok', message: 'No Blogs found for this date', year: year, month: month, day: day })

          } else {
            var dateBlogs = []
            for (i = 0; i < blogs.length; i++) {
              var dataset = {
                title: blogs[i].title,
                author: blogs[i].author,
                date: blogs[i].date
              }
              dateBlogs.push(dataset)
            }
            res.status(200).send({ code: 200, status: 'Ok', message: 'Blogs found for this date', year: year, month: month, day: day, data: dateBlogs  })
          }
        })
      } catch (error) {
        next(error)
      }
  // End returnDateBlogs Module
  },
// End export the Blog Controller Modules
}
