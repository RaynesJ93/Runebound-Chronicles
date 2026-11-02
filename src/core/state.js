// The single game-state object. Everything that is saved lives here.
// When you add a field, give it a default here: older saves pick it up automatically.
// When you rename or restructure a field, bump SAVE_VERSION in save.js and add a migration.

export function defaultState() {
  return {
    player: { area: 'brambleford', x: 16, y: 24, facing: 0 },
    run: { on: true, energy: 100 },
    settings: { dpad: 'auto', zoomStep: 0 },
    stats: { playTimeSec: 0, tilesWalked: 0 },
    flags: { seenMoveHint: false },
    createdAt: Date.now(),
  };
}
