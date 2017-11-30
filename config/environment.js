/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'stock',
    environment: environment,
    baseURL: '/',
    defaultLocationType: 'auto',

    'emberRollbarClient': {
      enabled: environment !== 'test' && environment !== 'development',
      accessToken: 'cc46e2e6402f4106a8ba71fe9752d69a',
      payload: {
        client: {
          javascript: {
            source_map_enabled: true, //this is now true by default
            code_version: process.env.SOURCE_VERSION,
            // Optionally have Rollbar guess which frames the error was thrown from
            // when the browser does not provide line and column numbers.
            environment: environment,
            guess_uncaught_frames: true
          }
        }
      }
    },

    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    contentSecurityPolicy: {
      "default-src": "'self' gap://ready file://* *",
      "img-src": "'self' data: https://res.cloudinary.com filesystem: *",
      "style-src": "'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com",
      "font-src": "'self' data: https://maxcdn.bootstrapcdn.com",
      "object-src": "'self'",
      "script-src": "'self' 'unsafe-eval' 'unsafe-inline'"
    },

    APP: {

      NAME: 'stock.goodcity',
      SHA: process.env.APP_SHA || "00000000",
      VERSION: process.env.VERSION || "1.0.0",
      environment: environment,

      CLOUD_NAME: 'ddoadcjjl',
      CLOUD_API_KEY: 926849638736153,
      CLOUD_URL: 'https://api.cloudinary.com/v1_1/ddoadcjjl/auto/upload',
      IMAGE_PATH: 'http://res.cloudinary.com/ddoadcjjl/image/upload/',

      NAMESPACE: 'api/v1',
      HK_COUNTRY_CODE: '+852',

      AIRBRAKE_HOST: "https://errbit.crossroads.org.hk",
      AIRBRAKE_PROJECT_ID: "",
      AIRBRAKE_PROJECT_KEY: "30d9f525c221cd7b00637cdc4eb0d7ae"

    },

    i18n: {
      defaultLocale: 'en'
    },

    cordova: {
      enabled: process.env.EMBER_CLI_CORDOVA !== '0',
      rebuildOnChange: false,
      emulate: false
    },

    sentry: {
       dsn: 'https://21fe90a0fc944c13b38d8090bc97f5d6:32224c98abc64ab393b2cbdc2acf344e@sentry.io/176461',
       development: false
    }
  };

  if (environment === 'development') {
    ENV.APP.API_HOST_URL = 'http://localhost:3000';
    ENV.APP.SOCKETIO_WEBSERVICE_URL = 'http://localhost:1337/goodcity';

    ENV.contentSecurityPolicy["connect-src"] = [
      'http://localhost:3000',
      'https://api.cloudinary.com',
      'http://localhost:4203',
      'http://localhost:1337',
      'ws://localhost:1337',
      'wss://localhost:1337',
      'https://api.rollbar.com'
    ].join(' ');

    ENV.contentSecurityPolicy["img-src"] = [
      'http://localhost:4200',
      'data: https://res.cloudinary.com',
      'blob: filesystem/g',
      'filesystem: *'
    ].join(' ');
  }

  if (environment === 'test') {
    ENV.cordova.enabled = false;

    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.API_HOST_URL = 'http://localhost:4203';
  }

  if (environment === 'production') {
    ENV.APP.API_HOST_URL = 'https://api.goodcity.hk';
    ENV.APP.SOCKETIO_WEBSERVICE_URL = 'https://socket.goodcity.hk:81/goodcity';

    ENV.contentSecurityPolicy["connect-src"] = [
      'https://api.goodcity.hk',
      'https://errbit.crossroads.org.hk',
      'https://api.rollbar.com',
      'https://socket.goodcity.hk:81',
      'ws://socket.goodcity.hk:81',
      'wss://socket.goodcity.hk:81',
      'https://sentry.io'
    ].join(' ');
  }

  if ((process.env.staging || process.env.STAGING) === 'true') {
    ENV.staging = true;
    ENV.APP.API_HOST_URL = 'https://api-staging.goodcity.hk';
    ENV.APP.SOCKETIO_WEBSERVICE_URL = 'https://socket-staging.goodcity.hk:81/goodcity';

    ENV.contentSecurityPolicy["connect-src"] = [
      'https://api-staging.goodcity.hk',
      'https://errbit.crossroads.org.hk',
      'https://api.rollbar.com',
      'https://sentry.io',
      'https://socket-staging.goodcity.hk:81',
      'ws://socket-staging.goodcity.hk:81',
      'wss://socket-staging.goodcity.hk:81'
    ].join(' ');
  } else {
    ENV.staging = false;
  }

  ENV.APP.SERVER_PATH  = ENV.APP.API_HOST_URL + '/' + ENV.APP.NAMESPACE;

  return ENV;
};
