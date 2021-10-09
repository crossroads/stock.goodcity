# fastlane documentation

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using

```
[sudo] gem install fastlane -NV
```

or alternatively using `brew install fastlane`

# Available Actions

## web

### web deploy

```
fastlane web deploy
```

Release web to stage

---

## iOS

### ios prepare_certificates

```
fastlane ios prepare_certificates
```

### ios staging

```
fastlane ios staging
```

Generate staging build (just upload to TestFairy)

### ios production

```
fastlane ios production
```

Upload to the AppStore

---

## Android

### android staging

```
fastlane android staging
```

Generate staging build (just upload to TestFairy)

### android production

```
fastlane android production
```

Upload to GooglePlay beta track

---

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
