module.exports = function(instance, options) {
  var express = require('express');
  var server = instance.server = express.createServer();

  server.configure(function() {
    var oneYear = 31557600000;

    server.use(express.bodyParser());
    server.use(express.methodOverride());
    server.use(express.cookieParser());
    server.use(express.session({secret: 'tanepiper.com'})); // Make this a hash

    server.use(express.static(options.static, { maxAge: oneYear }));
    server.use(express.staticCache());
    server.use(express.errorHandler());
  });
};