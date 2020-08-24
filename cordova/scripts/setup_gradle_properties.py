#!/usr/bin/env python

import os
import sys

target_props = {
  "android.useAndroidX": "true",
  "android.enableJetifier": "true"
};

cordova_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..'))
gradle_prop_path = os.path.abspath(os.path.join(cordova_path, 'platforms/android/gradle.properties'))

fd = open(gradle_prop_path, "r")
lines = fd.read().split('\n')
fd.close()

for k, v in target_props.items():
  replaced = False

  for i in range(len(lines)): 
    line = lines[i];
    if line.find(k) == 0:
      lines[i] = k + "=" + v
      replaced = True
      break

  if not replaced:
    lines.append(k + "=" + v)


fd = open(gradle_prop_path, "w")
fd.write("\n".join(filter(len, lines)))
fd.close(); 
