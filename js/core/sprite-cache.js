// ===========================
// SPRITE TINTING & CACHING
// ===========================

// Global cache: stores pre-tinted sprite frames
const spriteTintCache = new Map();

/**
 * Get a tinted version of a sprite frame (cached for performance)
 * @param {HTMLImageElement} img - Source sprite sheet
 * @param {number} frameIndex - Which frame to extract
 * @param {number} frameW - Frame width
 * @param {number} frameH - Frame height
 * @param {string} color - Hex color to tint (#FF0000)
 * @param {boolean} isLight - Use screen blend for light colors
 * @returns {HTMLCanvasElement} Tinted frame canvas
 */
export function getTintedFrame(img, frameIndex, frameW, frameH, color, isLight) {
  const key = `${img.src}|${frameIndex}|${color}|${isLight ? 1 : 0}`;
  
  // Return cached version if exists
  let cached = spriteTintCache.get(key);
  if (cached) return cached;
  
  // Create new tinted frame
  const canvas = document.createElement('canvas');
  canvas.width = frameW;
  canvas.height = frameH;
  const ctx = canvas.getContext('2d');
  
  // 1. Draw base frame
  ctx.drawImage(img, frameIndex * frameW, 0, frameW, frameH, 0, 0, frameW, frameH);
  
  // 2. Apply color tint
  ctx.globalCompositeOperation = isLight ? 'screen' : 'multiply';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, frameW, frameH);
  
  // 3. Restore alpha channel (preserve transparency)
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(img, frameIndex * frameW, 0, frameW, frameH, 0, 0, frameW, frameH);
  ctx.globalCompositeOperation = 'source-over';
  
  // Cache and return
  spriteTintCache.set(key, canvas);
  return canvas;
}

/**
 * Check if a hex color is "light" (needs screen blending instead of multiply)
 * @param {string} hex - Color in #RRGGBB format
 * @returns {boolean}
 */
export function isLightColorHex(hex) {
  const lightColors = new Set([
    '#FFFFFF',
    '#D3D3D3',
    '#F5DEB3',
    '#C0C0C0',
    '#A9A9A9'
  ]);
  return lightColors.has((hex || '').trim().toUpperCase());
}

/**
 * Clear the sprite cache (useful when loading new sprites)
 */
export function clearSpriteCache() {
  spriteTintCache.clear();
  console.log('🧹 Sprite cache cleared');
}