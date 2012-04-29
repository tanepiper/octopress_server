module.exports = function(socket, instance) {
  console.log('Socket.io Function Bound: getFlickrList');

  return function(message) {
    console.log('Flickr API Called');
    if (!message) {
      message = {};
    }
    if (!message.page) {
      message.page = 1;
    }

    var fs = require('fs');
    var path = require('path');
    var request = require('request');
    var moment = require('moment');
    var Seq = require('seq');

    var cache_file = instance.options.base + "/cache/getFlickrList.cache";
    path.exists(cache_file, function(exists) {
      if (exists) {
        fs.stat(cache_file, function(err, stats) {
          if (err) {
            return socket.emit('error', err.toString());
          }
          if (moment().diff(stats.mtime) >= 1800000) {
            getLatest();
          } else {
            fs.readFile(cache_file, function(err, data) {
              if (err) {
                return socket.emit('error', err.toString());
              }
              send_result(data.toString());
            });
          }
        });
      } else {
        getLatest();
      }
    });

    var getLatest = function() {
      console.log(instance.options);
      request({
        uri: 'http://api.flickr.com/services/rest',
        qs: {
          method: 'flickr.people.getPublicPhotos',
          user_id: instance.options.flickr.user_id,
          api_key: instance.options.flickr.api_key,
          extras: 'url_t,url_s,url_l,url_o',
          format: 'json',
          nojsoncallback: 1,
          per_page: 6,
          page: message.page
        },
        json: true
      }, return_result);
    };

    var output = [];
    var fetch_photo = function(photo, size, cb) {
      var filename = instance.options.base + '/client/cache/' + photo.id + '.' + size + '.jpg';
      path.exists(filename, function(exists) {
        if (!exists) {
          var stream = fs.createWriteStream(filename);
          stream.on('close', cb);
          stream.on('error', cb);
          request(photo[size]).pipe(stream);
        } else {
          cb();
        }
      });

    };

    var return_result = function(err, res, body) {
      if (err || body.stat === 'fail') {
        if (!err) {
          err = new Error(body.message);
        }
        return socket.emit('error', err.toString());
      }
      console.log(body);
      var _ref = body.photos.photo;
      Seq(_ref)
        .parEach(function(photo) {
          fetch_photo(photo, 'url_t', this);
        })
        .parEach(function(photo) {
          fetch_photo(photo, 'url_o', this);
        })
        .seqEach(function(photo) {
          output.push('<li><a class="fancybox" rel="group" href="/cache/' + photo.id + '.url_o.jpg"><img style="width:100px;height:100px;" src="/cache/' + photo.id + '.url_t.jpg" alt="' + photo.title +'" title="' + photo.title +'" /></a></li>');
          this();
        })
        .seq(function() {
          console.log(output.join("\n"));
          if (message.page !== 1) {
            return send_result(output.join("\n"));
          }
          cache_and_send_result(output.join("\n"));
        })
      .catch(function(err) {
        return socket.emit('error', err.toString());
      });
    };

    var cache_and_send_result = function(result) {
      fs.writeFile(cache_file, result, function(err) {
        if (err) {
          return socket.emit('error', err.toString());
        }
        send_result(result);
      });
    };

    var send_result = function(result) {
      socket.emit('flickrList', result);
    };
  };
};