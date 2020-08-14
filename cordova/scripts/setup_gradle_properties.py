#!/usr/bin/env python

import os
import sys

PROPS = {
  "android.useAndroidX": "true",
  "android.enableJetifier": "true"
};

cordova_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..'))
gradle_prop_path = os.path.abspath(os.path.join(cordova_path, '../platforms/android/gradle.properties'))

content = open(gradle_prop_path, "r").read()

print(content);