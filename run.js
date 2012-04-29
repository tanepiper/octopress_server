var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var store = new (require('socket.io-clusterhub'));

var serverTools = require('./server');

var options = require('./config');
var numReqs = 0;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    var worker = cluster.fork();
  }
} else {
  var instance = serverTools.createInstance(options, store);
}


process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  process.exit(1);
});