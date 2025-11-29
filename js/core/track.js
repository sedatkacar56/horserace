// ===========================
// TRACK RENDERING
// ===========================

import { ctx } from './canvas.js';

/**
 * Draw the racing track with all elements
 */
export function drawTrack(params, horses) {
  const { VIEW_W, VIEW_H, worldWidth, laneGap, laneOffset, finishLine, FURLONGS_TOTAL, START_X } = params;
  
  // Background gradient
  const topColor = window.TRACK_STYLE?.backgroundTop || '#D2B48C';
  const bottomColor = window.TRACK_STYLE?.backgroundBottom || '#C19A6B';
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, worldWidth, VIEW_H);
  
  // === INNER RAIL (top border) ===
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, laneOffset - laneGap / 2 - 8, worldWidth, 8);
  
  // Rail posts
  for (let x = 0; x < worldWidth; x += 80) {
    ctx.fillStyle = '#654321';
    ctx.fillRect(x, laneOffset - laneGap / 2 - 12, 6, 16);
  }
  
  // === OUTER RAIL (bottom border) ===
  const outerRailY = laneOffset - laneGap / 2 + horses.length * laneGap;
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, outerRailY, worldWidth, 8);
  
  // Rail posts
  for (let x = 0; x < worldWidth; x += 80) {
    ctx.fillStyle = '#654321';
    ctx.fillRect(x, outerRailY - 4, 6, 16);
  }
  
  // === STARTING GATE ===
  drawStartingGate(laneOffset, laneGap, outerRailY, horses);
  
  // === LANE DIVIDERS (dashed white lines) ===
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  for (let i = 1; i < horses.length; i++) {
    ctx.beginPath();
    ctx.moveTo(0, laneOffset - laneGap / 2 + i * laneGap);
    ctx.lineTo(worldWidth, laneOffset - laneGap / 2 + i * laneGap);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  
  // === FURLONG MARKERS ===
  drawFurlongMarkers(START_X, finishLine, FURLONGS_TOTAL, laneOffset, laneGap, outerRailY);
  
  // === FINISH LINE ===
  drawFinishLine(finishLine, VIEW_H);
  
  // === STARTING LINE ===
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(48, laneOffset - laneGap / 2, 4, outerRailY - (laneOffset - laneGap / 2));
}

/**
 * Draw starting gate with stalls
 */
function drawStartingGate(laneOffset, laneGap, outerRailY, horses) {
  const gateX = 30;
  const gateWidth = 15;
  const raceActive = window.raceActive || false;
  const raceFinished = window.raceFinished || false;
  
  // Gate frame
  ctx.fillStyle = '#4A4A4A';
  ctx.fillRect(gateX - 5, laneOffset - laneGap / 2 - 10, 5, outerRailY - (laneOffset - laneGap / 2) + 20);
  ctx.fillRect(gateX + gateWidth, laneOffset - laneGap / 2 - 10, 5, outerRailY - (laneOffset - laneGap / 2) + 20);
  
  // Individual stalls
  for (let i = 0; i < horses.length; i++) {
    const stallY = laneOffset - laneGap / 2 + i * laneGap;
    
    // Stall divider
    ctx.fillStyle = '#666';
    ctx.fillRect(gateX - 5, stallY + laneGap - 2, gateWidth + 10, 3);
    
    // Gate door (closed before race, open during)
    if (!raceActive && !raceFinished) {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
      ctx.fillRect(gateX, stallY, gateWidth, laneGap - 3);
      
      // Gate bars
      for (let b = 0; b < 4; b++) {
        ctx.fillStyle = '#888';
        ctx.fillRect(gateX + b * 4, stallY, 2, laneGap - 3);
      }
    }
    
    // Lane number on gate
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(i + 1, gateX + gateWidth / 2, stallY + laneGap / 2 + 6);
  }
}

/**
 * Draw furlong distance markers
 */
function drawFurlongMarkers(START_X, finishLine, FURLONGS_TOTAL, laneOffset, laneGap, outerRailY) {
  for (let f = 1; f <= FURLONGS_TOTAL; f++) {
    const x = START_X + (finishLine - START_X) * (f / FURLONGS_TOTAL);
    
    ctx.save();
    
    // Marker pole (dashed line)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(x, laneOffset - laneGap / 2);
    ctx.lineTo(x, outerRailY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Furlong pole top
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 3, laneOffset - laneGap / 2 - 20, 6, 16);
    
    // Furlong number
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#0066cc';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeText(`${FURLONGS_TOTAL - f + 1}f`, x, 5);
    ctx.fillText(`${FURLONGS_TOTAL - f + 1}f`, x, 5);
    
    ctx.restore();
  }
}

/**
 * Draw checkered finish line
 */
function drawFinishLine(finishLine, VIEW_H) {
  const finishWidth = 35;
  
  // Red finish post
  ctx.fillStyle = '#CC0000';
  ctx.fillRect(finishLine - 3, 0, 6, VIEW_H);
  
  // Checkered pattern
  const checkerSize = 20;
  for (let y = 0; y < VIEW_H; y += checkerSize) {
    for (let x = 0; x < finishWidth; x += checkerSize) {
      const isBlack = ((x / checkerSize) + (y / checkerSize)) % 2 === 0;
      ctx.fillStyle = isBlack ? '#000' : '#fff';
      ctx.fillRect(finishLine + 3, y, checkerSize, checkerSize);
      ctx.fillRect(finishLine + 3 + checkerSize, y, checkerSize, checkerSize);
    }
  }
  
  // Finish line banner
  ctx.fillStyle = 'rgba(204, 0, 0, 0.9)';
  ctx.fillRect(finishLine - 20, 10, finishWidth + 40, 35);
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('FINISH', finishLine + finishWidth / 2 - 10, 32);
  ctx.fillText('FINISH', finishLine + finishWidth / 2 - 10, 32);
}