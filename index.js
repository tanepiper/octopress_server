var argv = require('optimist').argv;
var cluster = require('cluster');
var serverTools = require('./server');
var path = require('path');

var socketio_cluster = new (require('socket.io-clusterhub'));

function start(start_options) {
  if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < start_options.number_instances; i++) {
      var worker = cluster.fork();
    }
  } else {
    var instance = serverTools.createInstance(start_options.config_file, socketio_cluster);
  }
}

if (!argv.config || !path.existsSync(argv.config)) {
  throw('You must pass a config file to start this server');
} else {
  var start_options = {
    number_instances: (argv.instances) ? argv.instances : require('os').cpus().length,
    config_file: require(path.normalize(argv.config))
  };
  start(start_options);
}

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  process.exit(1);
});