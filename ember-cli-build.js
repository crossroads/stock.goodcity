/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var webRelease = process.env.EMBER_CLI_CORDOVA === '0' && ['production', 'staging'].indexOf(process.env.EMBER_ENV) !== -1;

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sourcemaps: {
      enabled: true,
      extensions: ['js']
    },
    minifyJS: {
      options: {
        exclude: ["**/*.js"]
      }
    },
    fingerprint: {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map'],
      enabled: webRelease
    },
    gzip: {
      keepUncompressed: true,
      extensions: ['js', 'css', 'map', 'ttf', 'ott', 'eot', 'svg'],
      enabled: webRelease
    },
    sassOptions: {
      extension: 'scss'
    }
  });

  app.import('bower_components/moment/moment.js');
  app.import('bower_components/pickadate/lib/picker.js');
  app.import('bower_components/pickadate/lib/picker.date.js');
  app.import('bower_components/pickadate/lib/picker.time.js');

  app.import("bower_components/pickadate/lib/themes/default.css");
  app.import("bower_components/pickadate/lib/themes/default.date.css");
  app.import("bower_components/pickadate/lib/themes/default.time.css");

  app.import('bower_components/slick-carousel/slick/ajax-loader.gif');
  app.import('bower_components/slick-carousel/slick/slick-theme.css');
  app.import('bower_components/slick-carousel/slick/slick.css');
  app.import('bower_components/slick-carousel/slick/slick.js');
  app.import('bower_components/slick-carousel/slick/fonts/slick.eot', { destDir: "fonts" });
  app.import('bower_components/slick-carousel/slick/fonts/slick.svg', { destDir: "fonts" });
  app.import('bower_components/slick-carousel/slick/fonts/slick.ttf', { destDir: "fonts" });
  app.import('bower_components/slick-carousel/slick/fonts/slick.woff', { destDir: "fonts" });

  app.import('bower_components/lightgallery/src/css/lightgallery.css');
  app.import('bower_components/lightgallery/src/css/lg-transitions.css');
  app.import('bower_components/lightgallery/src/js/lightgallery.js');
  app.import('bower_components/lightgallery/src/js/lg-zoom.js');
  app.import('bower_components/lightgallery/src/fonts/lg.eot', { destDir: "fonts" });
  app.import('bower_components/lightgallery/src/fonts/lg.svg', { destDir: "fonts" });
  app.import('bower_components/lightgallery/src/fonts/lg.ttf', { destDir: "fonts" });
  app.import('bower_components/lightgallery/src/fonts/lg.woff', { destDir: "fonts" });
  app.import('bower_components/lightgallery/src/img/loading.gif', {
    destDir: '/img'
  });

  app.import('bower_components/foundation/js/foundation/foundation.js');
  app.import('bower_components/foundation/js/foundation/foundation.reveal.js');
  app.import('bower_components/foundation/js/foundation/foundation.topbar.js');

  app.import('bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget.js');
  app.import('bower_components/blueimp-file-upload/js/jquery.iframe-transport.js');
  app.import('bower_components/blueimp-file-upload/js/jquery.fileupload.js');
  app.import('bower_components/cloudinary/js/load-image.min.js');
  app.import('bower_components/cloudinary/js/jquery.cloudinary.js');
  app.import('bower_components/cloudinary/js/canvas-to-blob.min.js');
  app.import('bower_components/blueimp-file-upload/js/jquery.fileupload-process.js');
  app.import('bower_components/blueimp-file-upload/js/jquery.fileupload-image.js');
  app.import('bower_components/blueimp-file-upload/js/jquery.fileupload-validate.js');
  app.import('bower_components/cloudinary/js/jquery.cloudinary.js');
  app.import('bower_components/socket.io-client/socket.io.js');
  return app.toTree();
};
