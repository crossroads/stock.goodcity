#! /bin/bash

if [ -f $PROVISIONING_FILE ]
then
  echo "Mobile provisioning file found: $PROVISIONING_FILE"
  uuid=`grep UUID -A1 -a "$PROVISIONING_FILE" | grep -io "[-A-Z0-9]\{36\}"`

  # print info
  plistbuddy=/usr/libexec/PlistBuddy
  plist=`security cms -D -i "$PROVISIONING_FILE"`

  team=`"$plistbuddy" -c 'Print :TeamName' /dev/stdin <<< "$plist"`
  app=`"$plistbuddy" -c 'Print :AppIDName' /dev/stdin <<< "$plist"`
  teamid=`"$plistbuddy" -c 'Print :TeamIdentifier:0' /dev/stdin <<< "$plist"`
  expiry=`"$plistbuddy" -c 'Print :ExpirationDate' /dev/stdin <<< "$plist"`

  echo "Installing $PROVISIONING_FILE => $uuid.mobileprovision"
  echo "    Team:            $team"
  echo "    App:             $app"
  echo "    Team Identifier: $teamid"
  echo "    Expires:         $expiry"

  # copy provisioning file to ~/Library/MobileDevice/Provisioning Profiles/
  mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
  cp $PROVISIONING_FILE ~/Library/MobileDevice/Provisioning\ Profiles/$uuid.mobileprovision

  # import certificate into keychain
  CERT_FILE=`mktemp -t cert`
  echo "CERT_FILE=$CERT_FILE"
  "$plistbuddy" -c 'Print :DeveloperCertificates:0' /dev/stdin <<< "$plist" > $CERT_FILE
  security unlock-keychain -p circle circle.keychain
  security import $CERT_FILE -k circle.keychain -T /usr/bin/codesign

  # list all available identities to confirm installation
  echo "Currently installed Code-Signing identities:"
  security find-identity -p codesigning
else
  echo "Mobile provisioning file not found: $PROVISIONING_FILE"
fi
