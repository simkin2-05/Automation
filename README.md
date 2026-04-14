# Taxi Rush (React Native / Expo)

Taxi Rush is a top-down 2D mobile game inspired by South African minibus taxi culture, built from the attached PRD as a playable MVP.

## What is implemented

- Expo + TypeScript React Native app scaffold
- Navigation flow: Home -> Level Select -> Game -> Results
- Global game state with `useReducer` and AsyncStorage persistence
- 12 level configs (4 cities x 3 difficulties)
- Core gameplay loop using `requestAnimationFrame`
- Swipe left/right steering (90-degree turns)
- Tap-to-brake mechanic (temporary speed reduction)
- Passenger spawning and pickup rules
- Taxi rank delivery objective
- NPC traffic movement and collision slowdown penalty
- Police spawn, detection radius, chase state, and busted fail condition
- Countdown timer and time-up fail condition
- Result rewards and progression unlocks
- Upgrade shop (engine, tyres, tinted windows)
- Settings toggles + clear save data

## Quick start

```bash
npm install
npm run start
```

Then open in Expo Go on Android/iOS or run web preview.

If `expo` is not recognized on Windows, use:

```bash
npx expo start
```

If your local Git installation is missing or broken and EAS build fails with a VCS error, run:

```bash
npm run build:andriod:apk
```

This script sets `EAS_NO_VCS=1` automatically.

## Downloadable SDK package

Create a distributable SDK zip of this project:

```bash
npm run package:sdk
```

Output archives are written to:

- `dist-sdk/taxi-rush-sdk-latest.zip`
- `dist-sdk/taxi-rush-sdk-<timestamp>.zip`

This command is cross-platform and works on Windows (PowerShell), macOS, and Linux.

## Notes

This is an MVP implementation focused on gameplay mechanics and progression systems from the PRD. Production art assets, advanced pathfinding, audio/haptics integration, and platform release setup can be layered on next.
