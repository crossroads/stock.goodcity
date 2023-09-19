/* jshint node: true */
const pkgJson = require("../package.json");

module.exports = function(environment) {
  environment = process.env.ENVIRONMENT || environment || "development";
  var ENV = {
    modulePrefix: "stock",
    environment: environment,
    baseURL: "/",
    defaultLocationType: "auto",
    disableNotifications: process.env.DISABLE_NOTIFICATIONS === "true",
    emberRollbarClient: {
      enabled: environment !== "test" && environment !== "development",
      accessToken: "cc46e2e6402f4106a8ba71fe9752d69a",
      verbose: true,
      ignoredMessages: ["TransitionAborted"],
      payload: {
        environment: environment,
        client: {
          javascript: {
            // Optionally have Rollbar guess which frames the error was thrown from
            // when the browser does not provide line and column numbers.
            guess_uncaught_frames: false
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
      NAME: "stock.goodcity",
      ORIGIN: "stock.goodcity.hk",
      SHA: process.env.APP_SHA || "00000000",
      VERSION: pkgJson.version || "1.0.0",
      environment: environment,
      TITLE: "STOCK",
      BANNER_IMAGE: "/assets/images/stock.png",
      ANDROID_APP_ID: "hk.goodcity.stock",
      APPLE_APP_ID: "1144806764",
      BANNER_REOPEN_DAYS: 3,

      REVIEW_APP_NAME: "Stock App",
      ANDROID_APP_URL: "market://details?id=hk.goodcity.stock",

      CLOUD_NAME: "ddoadcjjl",
      CLOUD_API_KEY: 926849638736153,
      CLOUD_URL: "https://api.cloudinary.com/v1_1/ddoadcjjl/auto/upload",
      IMAGE_PATH: "http://res.cloudinary.com/ddoadcjjl/image/upload/",
      LONG_TERM_IMAGE_STORAGE_BASE_URL:
        "https://goodcityimages.blob.core.windows.net/images/",
      LONG_TERM_IMAGE_STORAGE_ID_PREFIX: "azure-",

      NAMESPACE: "api/v1",
      OTP_RESEND_TIME: 60,
      ACCESS_PASS_VALIDITY: 30,
      HK_COUNTRY_CODE: "+852",
      HK_TIME_ZONE: "Asia/Hong_Kong",
      DEFAULT_COUNTRY: "China - Hong Kong (Special Administrative Region)",

      SCANDIT_LICENSE_KEY_ANDROID: process.env.SCANDIT_LICENSE_KEY_ANDROID,
      SCANDIT_LICENSE_KEY_IOS: process.env.SCANDIT_LICENSE_KEY_IOS,

      PRELOAD_TYPES: [
        "booking_type",
        "purpose",
        "identity_type",
        "lookup",
        "district",
        "goodcity_setting",
        "printer",
        "user_favourite",
        "role"
      ],
      USER_DATA_TYPES: [
        "designation",
        "item",
        "order_transport",
        "beneficiary",
        "contact",
        "gogovan_transport",
        "user",
        "user_profile",
        "role",
        "user_role",
        "role_permission",
        "image",
        "packages_location",
        "stockit_contact",
        "goodcity_request",
        "purpose",
        "orders_process_checklist"
      ]
    },

    i18n: {
      defaultLocale: "en"
    },

    cordova: {
      enabled: process.env.EMBER_CLI_CORDOVA !== "0",
      rebuildOnChange: false,
      emulate: false
    }
  };

  if (environment === "development") {
    ENV.APP.ORIGIN = "localhost";
    ENV.APP.API_HOST_URL = "http://localhost:3000";
    ENV.APP.SOCKETIO_WEBSERVICE_URL = "http://localhost:1337/goodcity";
    ENV.APP.DONOR_APP_URL = "http://localhost:4200";
    ENV.APP.CHARITY_APP_URL = "http://localhost:4202";
    ENV.contentSecurityPolicy["connect-src"] = [
      "http://localhost:3000",
      "https://api.cloudinary.com",
      "http://localhost:4203",
      "http://localhost:1337",
      "ws://localhost:1337",
      "wss://localhost:1337",
      "https://api.rollbar.com"
    ].join(" ");

    ENV.contentSecurityPolicy["img-src"] = [
      "http://localhost:4200",
      "data: https://res.cloudinary.com",
      "blob: filesystem/g",
      "filesystem: *"
    ].join(" ");
  }

  if (environment === "test") {
    ENV.cordova.enabled = false;

    // Testem prefers this...
    ENV.baseURL = "/";
    ENV.locationType = "none";

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = "#ember-testing";
    ENV.APP.API_HOST_URL = "http://localhost:4203";
  }

  if (environment === "production") {
    if (!process.env.ENVIRONMENT)
      throw "Please pass an appropriate ENVIRONMENT=(staging|production) param.";
    ENV.APP.API_HOST_URL = "https://api.goodcity.hk";
    ENV.APP.SOCKETIO_WEBSERVICE_URL = "https://socket.goodcity.hk:81/goodcity";
    ENV.APP.DONOR_APP_URL = "https://app.goodcity.hk/";
    ENV.APP.CHARITY_APP_URL = "https://charities.goodcity.hk/";

    ENV.contentSecurityPolicy["connect-src"] = [
      "https://api.goodcity.hk",
      "https://api.rollbar.com",
      "https://socket.goodcity.hk:81",
      "ws://socket.goodcity.hk:81",
      "wss://socket.goodcity.hk:81"
    ].join(" ");
  }

  if (environment === "staging") {
    ENV.APP.ORIGIN = "stock-staging.goodcity.hk";
    ENV.APP.API_HOST_URL = "https://api-staging.goodcity.hk";
    ENV.APP.SOCKETIO_WEBSERVICE_URL =
      "https://socket-staging.goodcity.hk/goodcity";
    ENV.APP.DONOR_APP_URL = "https://app-staging.goodcity.hk/";
    ENV.APP.CHARITY_APP_URL = "https://charities-staging.goodcity.hk/";
    ENV.contentSecurityPolicy["connect-src"] = [
      "https://api-staging.goodcity.hk",
      "https://api.rollbar.com",
      "https://socket-staging.goodcity.hk",
      "ws://socket-staging.goodcity.hk",
      "wss://socket-staging.goodcity.hk"
    ].join(" ");
  }

  ENV.APP.SERVER_PATH = ENV.APP.API_HOST_URL + "/" + ENV.APP.NAMESPACE;
  return ENV;
};
