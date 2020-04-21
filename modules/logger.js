// modules/logger.js

var logger = function(req, res, next) {
var method = req.method
var path = req.path

console.log(method +' ' +path);
 next()
}

module.exports = logger;
