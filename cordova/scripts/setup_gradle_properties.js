const fs = require("fs");
const path = require("path");

const PROPS = {
  "android.useAndroidX": "true",
  "android.enableJetifier": "true"
};

module.exports = function(ctx) {
  // Make sure android platform is part of build
  if (!ctx.opts.platforms.includes("android")) return;

  const platformRoot = path.join(ctx.opts.projectRoot, "platforms/android");
  const gradlePropertiesFile = path.join(platformRoot, "gradle.properties");

  const lines = fs
    .readFileSync(gradlePropertiesFile)
    .toString()
    .split("\n");

  for (let key in PROPS) {
    let value = PROPS[key];
    let replaced = false;

    // Try and replace existing
    for (let i in lines) {
      const line = lines[i];
      if (line.indexOf(key) === 0) {
        lines[i] = `${key}=${value}`;
        replaced = true;
      }
    }

    // Add if missing
    if (!replaced) {
      lines.push(`${key}=${value}`);
    }
  }

  fs.writeFileSync(gradlePropertiesFile, lines.join("\n") + "\n");
};
