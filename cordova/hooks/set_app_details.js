// Sets the following parameters in config.xml and package.json
//
// app id = hk.goodcity.(<AppName>|<AppName>staging)
// app name = (<AppName>|S. <AppName>)
// app version = <main project package.json>.<CIRCLE_BUILD_NUM>
// app android-versionCode = <CIRCLE_BUILD_NUM> + <seed>
// app ios-CFBundleVersion = <CIRCLE_BUILD_NUM>
//
// ENVIRONMENT VARIABLES
//   process.env.ENVIRONMENT = (staging|production)
//   process.env.CIRCLE_BUILD_NUM = <numeric>

module.exports = context => {
  let android_build_version_seed = 80000;
  let androidversionCode = "";
  let iosCFBundleVersion = "";

  const cordovaCommon = context.requireCordovaModule("cordova-common");

  // staging or production?
  let staging = process.env.ENVIRONMENT !== "production";

  // append CIRCLE_BUILD_NUM to app version
  let path = require("path");
  let pkg = require("../../package.json");
  app_version = pkg.version;
  build_num = parseInt(process.env.CIRCLE_BUILD_NUM);
  if (!isNaN(build_num)) {
    app_version = app_version + "." + build_num;
  }

  // App specific build numbers
  circle_build_num = parseInt(process.env.CIRCLE_BUILD_NUM);
  if (!isNaN(circle_build_num)) {
    androidversionCode = android_build_version_seed + circle_build_num;
    iosCFBundleVersion = circle_build_num;
  }

  //config.xml
  let configPath = path.join(context.opts.projectRoot, "config.xml");
  let config = new cordovaCommon.ConfigParser(configPath);
  config.setPackageName(app_name);
  config.setName(displayName);
  config.setVersion(app_version);
  config.doc.getroot().set("android-versionCode", androidversionCode);
  config.doc.getroot().set("ios-CFBundleVersion", iosCFBundleVersion);
  config.write();
};
