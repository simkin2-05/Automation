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

## Notes

This is an MVP implementation focused on gameplay mechanics and progression systems from the PRD. Production art assets, advanced pathfinding, audio/haptics integration, and platform release setup can be layered on next.
