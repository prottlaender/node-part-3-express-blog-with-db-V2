// database/controllers/userController.js

// load the user and blog models
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

// export the Blog Controller Modules
module.exports = {

  // create Blog Module
  createBlog: function (req, res) {
    // create the User.findOne filter object using the
    // author email from request body and assign it to newBlogAuthorEmail
    // User.findOne will be used (1) to check if the author exist and
    // (2) to add the new blogid as blog reference on the authors user object
    var newBlogAuthorEmail = { email: req.body.email }

    // create the Blog.findOne filter object using the
    // new blog title from request body and assign it to newBlogTitle
    // Blog.findOne will be used to retrieve the new created blogid which will
    // be added as blog reference on the authors user object
    var newBlogTitle = { title: req.body.title }

    // create the new Blog Object with input from the req.body
    const newBlog = new Blog({
      title: req.body.title,
      "author.firstname": req.body.firstname,
      "author.lastname": req.body.lastname,
      "author.email": req.body.email,
      date: req.body.date,
    })
    
    // Query User and filter for newBlogAuthorEmail then call function(user) to
    // check if a user with newBlogAuthorEmail exist
    User.findOne(newBlogAuthorEmail).then(function(user) {
      if(!user) {
        // if no user found end the request and send response
        res.send('No User for this Author Email. Create Blog not possible')
      } else {
        // save new Blog Object
        newBlog.save((error) => {
          if (error) {
            // in case of an error in input validation end the request and send response
            res.send( { status: 'Blog validation error', message: error.message } )

          } else {
            // Query Blog and filter for newBlogTitle then call function(blog) to
            // check if a blog with newBlogTitle exist
            Blog.findOne(newBlogTitle).then(async function(blog) {
              if (!blog) {
                // if no blog found end the request and send response
                res.send('No Blog with this Title. Retrieving blogid not possible')

              } else {
                // assign the new blog id of the just created Blog Object to newBlogId
                const newBlogId = blog._id
                // define an empty blog reference array and assign to idArr
                var idArr = []
                // define newBlogId reference object and assign to idObj
                var idObj = { _id: newBlogId }
                // push idObj into the idArr
                idArr.push(idObj)
                // update the author user object and add the new blog reference array
                await User.updateOne(newBlogAuthorEmail, { "$push": { "ref.blogs": idArr } })
                res.send('Blog successfully created and User updated. Retrieving blogid :' +newBlogId)

              }
            })
          }
        })
      }
    })
  // End create Blog Module
  },

  // removeBlog Module
  removeBlog: function(req, res) {
    // create the Blog.findOne filter object using the
    // blog title from request body and assign it to newBlogTitle
    var removeBlogTitle = { title: req.body.title }

    // Query Blog and filter for removeBlogTitle then call function(blog) to
    // check if a blog with removeBlogTitle exist
    Blog.findOne(removeBlogTitle).then(function(blog) {
      if(!blog) {
        // if no blog found end the request and send response
        res.send('No Blog with this Title. Blog Removal not possible')

      } else {
        // create the blogid reference object
        var removeBlogId = { _id: blog._id }
        // create the User.findOne filter object using the
        // author email from blog object and assign it to removeBlogAuthorEmail
        var removeBlogAuthorEmail = { email: blog.author.email }

        // Query User and filter for removeBlogAuthorEmail then call function(user) to
        // check if a user with removeBlogAuthorEmail exist
        User.findOne(removeBlogAuthorEmail).then(function(user) {
          if (!user) {
            // if no user found end the request and send response
            res.send('No User with this Author Email. Blog Removal not possible')
          } else {
            // if user exist delete blog match removeBlogId
            Blog.deleteOne(removeBlogId, async function(error) {
              if (error) {
                // in case an error occur end the request and send response
                res.send( { status: 'Blog deletion error', message: error.message } )
              } else {
                // update the User Object that match removeAuthorEmail
                // and remove the blogid reference object from the user using the $pull operator
                await User.updateOne(removeBlogAuthorEmail, { "$pull": { "ref.blogs": removeBlogId } })
                res.send('Blog successfully removed. User successfully updated')
              }
            })
          }
        })
      }
    })
  // End removeBlog Module
  },

  // returnAllBlogs Module
  returnAllBlogs: function(req, res, next) {

    if (url == '/blogs') {

      // find all Blog Objects in database to be displayed
      // all blogs stored in blogs array
      Blog.find({}, function(error, blogs) {

        if (error) {
          // in case of an error end the request and send response
          res.send( { status: 'Blog query error', message: error.message } )

        } else if (blogs.length == 0) {
            // in case no blog found end the request and send response
            res.send('no blogs found')

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
          res.send(allBlogs)
        }

      })

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

      // find all Blog Objects in database to be displayed that match timeQuery
      // all found blogs stored in blogs array
      Blog.find(timeQuery, function(error, blogs) {

        if (error) {
          res.send( { status: 'Blog query error', message: error.message } )

        } else if (blogs.length == 0) {
            res.send('no blogs found for this year')

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
          res.send(yearBlogs)
        }
      })

    } else {
      next()
    }
  // End returnYearBlogs Module
  },

  // returnMonthBlogs Module
  returnMonthBlogs: function(req, res, next) {

    if (url == '/blogs'+'/'+year+'/'+month) {

      // $gte: value greater or equal
      // $lte: value lower or equal
      var gte = year+'-'+month+'-'+'01'
      var lte = year+'-'+month+'-'+'31'
      var timeQuery = { date: {$gte: gte, $lte: lte} }

      Blog.find(timeQuery, function(error, blogs) {

        if (error) {
          res.send( { status: 'Blog query error', message: error.message } )

        } else if (blogs.length == 0) {
            res.send('no blogs found for this year and month')

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
          res.send(yearBlogs)
        }
      })

    } else {
      next()
    }
  // End returnMonthBlogs Module
  },

  // returnDateBlogs Module
  returnDateBlogs: function(req, res) {

    // $gte: value greater or equal
    // $lte: value lower or equal
    var gte = year+'-'+month+'-'+day
    var lte = year+'-'+month+'-'+day
    var timeQuery = { date: {$gte: gte, $lte: lte} }

    Blog.find(timeQuery, function(error, blogs) {

      if (error) {
        res.send( { status: 'Blog query error', message: error.message } )

      } else if (blogs.length == 0) {
          res.send('no blogs found for this date')

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
        res.send(yearBlogs)
      }
    })
  // End returnDateBlogs Module
  },

// End export the Blog Controller Modules
}
