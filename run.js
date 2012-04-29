var serverTools = require('./server');

var instance = serverTools.createInstance({
  base: __dirname,
  static: __dirname + '/client',
  socketio_options: {
    events: ['getFlickrList']
  }
});