// ===========================
// CANVAS SETUP & RENDERING
// ===========================

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// High-DPI (Retina) rendering setup
export const DPR = Math.max(3, window.devicePixelRatio || 1);

/**
 * Initialize canvas with proper dimensions and quality settings
 */
export function initCanvas(viewWidth, viewHeight) {
  canvas.width = viewWidth * DPR;
  canvas.height = viewHeight * DPR;
  canvas.style.width = viewWidth + 'px';
  canvas.style.height = viewHeight + 'px';
  
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.imageSmoothingEnabled = false; // pixel-art style
  ctx.imageSmoothingQuality = 'high';
  
  // Apply track styling from horses.js
  applyTrackStyling();
  
  console.log(`🖼️ Canvas initialized: ${viewWidth}x${viewHeight} (${DPR}x DPI)`);
}

/**
 * Apply track border and background colors
 */
function applyTrackStyling() {
  if (window.TRACK_STYLE) {
    const top = window.TRACK_STYLE.backgroundTop || '#7CB342';
    const bottom = window.TRACK_STYLE.backgroundBottom || '#558B2F';
    const border = window.TRACK_STYLE.border || '#8B4513';
    
    canvas.style.background = `linear-gradient(${top}, ${bottom})`;
    canvas.style.border = `8px solid ${border}`;
  }
}

/**
 * Clear the canvas (useful for testing)
 */
export function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}