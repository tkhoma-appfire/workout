# Workout — React Native (Android)

Hello-world React Native app for the Workout project. Layout and tooling match [heating/android](https://github.com/) (RN 0.88, Gradle Makefile, embedded debug bundle).

## Prerequisites

- Node.js ≥ 22
- JDK 21
- Android SDK — set `sdk.dir` in `android/local.properties` (copy from heating or Android Studio)

## Run on Android

```bash
cd android
npm install
npm start          # terminal 1 — Metro
npm run android    # terminal 2 — emulator/device
```

Or build/install a standalone debug APK (JS bundled, no Metro):

```bash
make install-debug
```

## Launcher icon

Icons are generated from `assets/app-logo.jpeg`:

```bash
./scripts/generate-android-icons.sh
```

Requires ImageMagick (`magick`). Adaptive icon background matches the photo (`#525657` in `res/values/colors.xml`).

## App entry

- `App.tsx` — “Workout / Hello, world!”
- Native package: `com.workout_app`
- JS component name: `workout_app` (see `app.json`)
