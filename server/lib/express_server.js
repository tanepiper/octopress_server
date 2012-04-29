module.exports = function(instance, options) {
  var express = require('express');
  var server = instance.server = express.createServer();

  server.configure(function() {
    var oneYear = 31557600000;
    //server.use(express.cache());
    server.use(express.static(options.static, { maxAge: oneYear }));
    server.use(express.errorHandler());
  });
};