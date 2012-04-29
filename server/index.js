module.exports = (function() {

  var createInstance = function(options) {
    var instance = {};
    options = options || {};

    var _ = require('underscore');

    _.defaults(options, {
      host: 'localhost',
      port: 3500,
      views: __dirname + '/views',
      static: __dirname + '/static',
      express_options: {},
      socketio_options: {}
    });

    instance.options = options;

    require('./lib/express_server')(instance, options);
    require('./lib/socket.io')(instance, options);

    instance.server.listen(options.port);

    return instance;
  };

  return {
    createInstance: createInstance
  };

}());