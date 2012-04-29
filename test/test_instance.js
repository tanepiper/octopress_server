/** Test File 1 **/

var store = new (require('socket.io-clusterhub'));
var serverTools = require('./../server');
var options = require('./../config');
var assert = require('assert');
var request = require('request');

var host = 'localhost';
var port = 3500;

var instance = serverTools.createInstance(options, store);

assert.equal(host, instance.options.host);
assert.ok(instance.server);
assert.ok(instance.io);

request({
  uri: 'http://' + host + ':' + port
}, function(err, res, body) {
  assert.ifError(err);
  assert.equal(200, res.statusCode);
})