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

    // try to find a user by author email and catch default error in case query fail
    try {
      // find one user by author email
      User.findOne( { email: authorEmail }, function(error, user) {
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
              // in case of an input validation err occur end the request and send response
              res.status(400).send({ code: 400, status: 'Bad Request', message: 'Input validation error: ' +err.message })

            } else {
              // try to update user with blog reference and catch individual error in case query fail
              try {
                // update the author user object with the new blog reference array
                User.updateOne( { email: authorEmail }, { $push: { 'ref.blogs': [{ _id: blog._id }] } }, function(err, result) {
                  res.status(200).send({ code: 200, status: 'Ok', message: 'Blog successfully created and User updated. Retrieving blogid: ' +blog._id })
                })
              // catch err in case User.updateOne fail and invoke individual err handler
              } catch (err) {
                res.status(502).send({ code: 502, status: 'Bad Gateway', message: 'New Blog saved but update User blog reference failed: ' +err.message })
              }
            }
          })
        }
      })
    // catch error in case User.findOne fail and invoke default error handler
    } catch (error) {
      next(error)
    }
  // End create Blog Module
  },

  // removeBlog Module
  removeBlog: function(req, res, next) {
    // try to find one blog to be removed by title. catch default error in case it does not work
    try {
      // find one blog to be removed by title
      Blog.findOne({ title: req.body.title }, function(error, blog) {
       if (!blog) {
          // if no blog found end the request and send response
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'No Blog with this Title. Blog Removal not possible' })

        } else {
          // if blog has been found
          // try to find a user by author email. catch default error if it does not work
          try {
            // find one user by author email
            User.findOne({ email: blog.author.email }, function(error, user) {
              if (!user) {
                // if no user has been found
                // try to delete only one blog by blog id. catch default error if it does not work
                try {
                  // delete only one blog
                  Blog.deleteOne({ _id: blog._id }, function(error, result) {
                    res.status(200).send({ code: 200, status: 'Ok', message: 'Blog removed. No User found to update User blog reference' })
                  })
                // catch error in case Blog.deleteOne fail and invoke default error handler
                } catch (error) {
                  next(error)
                }

              } else {
                // if user has been found
                // try to delete one blog by blog id and update user. catch default error if it does not work
                try {
                  // delete one blog
                  Blog.deleteOne({ _id: blog._id }, function(error, result) {
                    // try to update user Object and catch individual err if it does not work
                    try {
                        // remove blog id reference object from the user Object using the $pull operator
                        User.updateOne({ email: blog.author.email }, { $pull: { 'ref.blogs': { _id: blog._id } } }, function(err, result) {
                          res.status(200).send({ code: 200, status: 'Ok', message: 'Blog removed. User blog reference successfully updated' })
                        })
                    // catch err in case User.updateOne fail and invoke individual err handler
                    } catch (err) {
                      res.status(502).send( { code: 502, status: 'Bad Gateway', message: 'Blog removed but update User blog reference failed: ' +err.message } )
                    }

                  })
                // catch error in case Blog.deleteOne fail and invoke default error handler
                } catch (error) {
                  next(error)
                }
              }
            })
          // catch error in case User.findOne fail and invoke default error handler
          } catch (error) {
            next(error)
          }
        }
      })
    // catch error in case Blog.findOne fail and invoke default error handler
    } catch (error) {
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
