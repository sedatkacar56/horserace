// ===========================
// SPRITE RENDERING
// ===========================

import { ctx } from './canvas.js';
import { getTintedFrame, isLightColorHex } from './sprite-cache.js';
import { spriteConfig } from '../config/sprite_config.js';
import { SPRITE_DEFAULTS } from '../config/sprite_config.js';

/**
 * Draw a horse sprite with animation
 */
export function drawHorseSprite(horse, dt, horseSprite) {
  const { frames = 8, scale = 1, fps = 12 } = spriteConfig;
  const hasCustomSprite = horse.sprite && horse.sprite.img && horse.sprite.img.complete;
  const hasDefaultSprite = !hasCustomSprite && horseSprite && horseSprite.complete;
  
  // Animation state
  const MOVING_EPS = 0.08;
  const baseSpeed = horse.stats?.baseSpeed || 1;
  const moving = (horse.speed || 0) > MOVING_EPS && !horse.stopped && !horse.animFreeze;
  
  if (horse.animTimer == null) horse.animTimer = 0;
  if (moving) {
    // Tie FPS to relative speed
    const speedFactor = Math.min(2.0, Math.max(0.6, (horse.speed || 0) / baseSpeed));
    horse.animTimer += dt * fps * speedFactor;
    horse.animState = 'RUN';
  } else {
    // Freeze when stopping
    if (horse._wasMoving) horse.animTimer = 0;
    horse.animState = 'IDLE';
  }
  horse._wasMoving = moving;
  
  // Choose source image & geometry
  let img, frameCount, drawScale;
  if (hasCustomSprite) {
    img = horse.sprite.img;
    frameCount = Math.max(1, horse.sprite.frames || frames);
    drawScale = horse.sprite.scale ?? scale;
  } else if (hasDefaultSprite) {
    img = horseSprite;
    frameCount = Math.max(1, SPRITE_DEFAULTS.frames);
    drawScale = SPRITE_DEFAULTS.scale;
  } else {
    // Fallback circle
    drawFallbackCircle(horse);
    return;
  }
  
  const frameW = Math.floor(img.width / frameCount);
  const frameH = img.height;
  
  // Frame index
  const IDLE_FRAME = 0;
  const RUN_START = 0;
  const RUN_FRAMES = Math.max(1, Math.min(frameCount, (spriteConfig.runFrames || frameCount)));
  const frameIndex = (horse.animState === 'IDLE')
    ? IDLE_FRAME
    : (RUN_START + (Math.floor(horse.animTimer) % RUN_FRAMES));
  
  // Get tinted frame (cached)
  const light = isLightColorHex(horse.color);
  const tinted = getTintedFrame(img, frameIndex, frameW, frameH, horse.color || '#ffffff', light);
  
  // Draw
  const drawW = frameW * drawScale;
  const drawH = frameH * drawScale;
  
  ctx.save();
  ctx.translate(horse.x, horse.y);
  
  // Optional facing
  const flip = horse.facing === 'left' ? -1 : 1;
  ctx.scale(flip, 1);
  
  // Center-bottom anchor
  ctx.drawImage(tinted, -flip * (drawW * 0.5), -drawH * 0.5 - 45, flip * drawW, drawH);
  
  // Name label
  const nameYOffset = -drawH * 0.6;
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 4;
  ctx.strokeText(horse.name, 0, nameYOffset);
  ctx.fillStyle = '#fff';
  ctx.fillText(horse.name, 0, nameYOffset);
  
  // Whip flash effect
  if (horse.whipFlash > 0) {
    ctx.globalAlpha = horse.whipFlash * 0.6;
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, -drawH * 0.5, drawW * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  
// 🔥 SPUR FLASH EFFECT
// 🔵 SPUR FLASH EFFECT (Electric Blue)

// 🔥 RED SPUR FLASH EFFECT
if (horse.spurFlash > 0) {
    ctx.globalAlpha = horse.spurFlash * 0.75;

    // Bright fiery red (visible!)
    ctx.fillStyle = "rgba(255, 60, 60, 0.55)";
    ctx.shadowColor = "rgba(255, 60, 60, 0.9)";
    ctx.shadowBlur = 25;

    ctx.beginPath();
    ctx.arc(0, -drawH * 0.5, drawW * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

if (horse.pressureFlash > 0) {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "rgba(0, 80, 255, 0.45)"; // strong but elegant blue
    ctx.shadowColor = "rgba(0, 80, 255, 0.6)";
	 ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, -drawH * 0.4, drawW * 0.75, 0, Math.PI * 2);
    ctx.fill();
	    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

	
  
  ctx.restore();
}

/**
 * Draw fallback circle when no sprite available
 */
function drawFallbackCircle(horse) {
  ctx.save();
  ctx.translate(horse.x, horse.y);
  ctx.fillStyle = horse.color || '#555';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(horse.lane ?? '', 0, 0);
  
  // Name
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 4;
  ctx.strokeText(horse.name, 0, -30);
  ctx.fillStyle = '#fff';
  ctx.fillText(horse.name, 0, -30);
  ctx.restore();
}