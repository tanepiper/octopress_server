var serverTools = require('./server');

var options = require('./config');

var instance = serverTools.createInstance(options);

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  process.exit(1);
});