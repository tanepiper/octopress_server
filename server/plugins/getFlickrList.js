module.exports = function(socket, instance) {
  console.log('Socket.io Function Bound: getFlickrList');

  return function(message) {
    console.log('Flickr API Called');

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
            return socket.emit('error', err);
          }
          if (moment().diff(stats.mtime) >= 1800000) {
            getLatest();
          } else {
            fs.readFile(cache_file, function(err, data) {
              if (err) {
                return socket.emit('error', err);
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
      request({
        uri: 'http://api.flickr.com/services/rest',
        qs: {
          method: 'flickr.people.getPublicPhotos',
          user_id: '53352905@N05',
          api_key: 'ba19c3d5e56b3f1f47429b27bf319394',
          extras: 'url_t,url_s,url_l,url_o',
          format: 'json',
          nojsoncallback: 1,
          per_page: 6
        },
        json: true
      }, return_result);
    };

    var output = [];
    var fetch_photo = function(photo, size, cb) {
      request(photo[size]).pipe(fs.createWriteStream(instance.options.base + '/client/cache/' + photo.id + '.' + size + '.jpg'));
      cb();
    };

    var return_result = function(err, res, body) {
      if (err) {
        return socket.emit('error', err);
      }
      var _ref = body.photos.photo;
      Seq(_ref)
        .seqEach(function(photo) {
          fetch_photo(photo, 'url_t', this);
        })
        .seqEach(function(photo) {
          fetch_photo(photo, 'url_o', this);
        })
        .seqEach(function(photo) {
          output.push('<li><a class="fancybox" rel="group" href="/cache/' + photo.id + '.url_o.jpg"><img style="width:100px;height:100px;" src="/cache/' + photo.id + '.url_t.jpg" alt="' + photo.title +'" title="' + photo.title +'" /></a></li>');
          this();
        })
        .seq(function() {
          cache_and_send_result(output.join("\n"));
        });
    };

    var cache_and_send_result = function(result) {
      fs.writeFile(cache_file, result, function(err) {
        if (err) {
          return socket.emit('error', err);
        }
        send_result(result);
      });
    };

    var send_result = function(result) {
      socket.emit('flickrList', result);
    };
  };
};