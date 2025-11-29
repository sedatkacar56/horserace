// ===========================
// SPRITE CONFIGURATION
// ===========================

// Default sprite settings
export const SPRITE_DEFAULTS = {
  src: 'assets/default.jpg',
  frames: 6,
  scale: 1.0,
  fps: 14,
  runFrames: 6 // How many frames in the run cycle
};

// Shared sprite configuration (can be modified by UI)
export const spriteConfig = {
  frames: SPRITE_DEFAULTS.frames,
  scale: SPRITE_DEFAULTS.scale,
  fps: SPRITE_DEFAULTS.fps,
  runFrames: SPRITE_DEFAULTS.runFrames
};

/**
 * Update sprite configuration
 */
export function updateSpriteConfig(updates) {
  Object.assign(spriteConfig, updates);
  console.log('🎨 Sprite config updated:', spriteConfig);
}

/**
 * Reset sprite config to defaults
 */
export function resetSpriteConfig() {
  Object.assign(spriteConfig, SPRITE_DEFAULTS);
  console.log('🔄 Sprite config reset to defaults');
}