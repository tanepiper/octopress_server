module.exports = function(instance, options) {
  var io = instance.io = require('socket.io').listen(instance.server);

  io.configure(function() {
    io.enable('browser client etag');
    io.set('log level', 1);
    io.set('transports', ['xhr-polling', 'jsonp-polling']);
  });

  io.sockets.on('connection', function(socket) {
    socket.emit('connected', {level: 'info', message: 'Server connection recieved'});
    if (typeof options.socketio_options.onConnection === 'function') {
      options.socketio_options.onConnection.call(this, arguments);
    }

    if (options.socketio_options.events && options.socketio_options.events.length > 0) {
      for (var i = 0, j = options.socketio_options.events.length; i < j; i++) {
        var event = options.socketio_options.events[i];
        socket.on(event, require(__dirname + '/../plugins/' + event)(socket, instance));
      }
    }
  });
};