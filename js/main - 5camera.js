// ===========================
// MAIN GAME ORCHESTRATOR
// ===========================
import { canvas, ctx, initCanvas, DPR } from './core/canvas.js';
import { drawTrack } from './core/track.js';
import { drawHorseSprite } from './core/sprite-renderer.js';
import { SPRITE_DEFAULTS } from './config/sprite_config.js';
import { 
  startRace, 
  actuallyStartRace, 
  resetRace, 
  togglePause, 
  handleHorseFinish,
  raceActive,
  raceFinished,
  isPaused,
  finishOrder,
  raceHistory
} from './game/race-manager.js';
import { 
  playerSystem, 
  initPlayerControls, 
  setupHorseSelection, 
  updatePlayerSystem 
} from './features/player-system.js';
import { 
  refreshLeaderboard, 
  showStrategySummary, 
  updateCompleteStats 
} from './ui/leaderboard.js';
import { 
  updateRaceResults,
  showWinnerModal,
  initResultsPanel, 
  downloadRaceHistory, 
  updateRaceHistory 
} from './ui/race-results.js';
import { updateWhipHUD } from './ui/whip-hud.js';
import { createHorseSelectionModal } from './ui/horse-selection.js';
import { 
  createSettingsPanel, 
  initSettingsPanel, 
  setupSpriteUpload, 
  setupUIToggle 
} from './ui/settings-ui.js';
import { 
  createWhipCountInput,
  getWhipCountFromInput ,
  updateControlButtons, 
  createStatsPanel, 
  setupStatsPanelDrag 
} from './ui/controls-ui.js';
// ===========================
// GAME STATE
// ===========================
const PARAMS = window.RACE_PARAMS || {
  cw: 1200,
  ch: 600,
  ww: 5000,
  lg: 10,
  lo: 100,
  fl: 4500
};
const VIEW_W = PARAMS.cw;
const VIEW_H = PARAMS.ch;
const worldWidth = PARAMS.ww;
const laneGap = PARAMS.lg;
const laneOffset = PARAMS.lo;
const finishLine = PARAMS.fl;
const START_X = 50;
const PPF = window.RACE_PARAMS?.pixelsPerFurlong ?? 1000;
const FURLONGS_TOTAL = (window.RACE_PARAMS?.furlongs) ?? Math.round((finishLine - START_X) / PPF);
// Camera
let cameraX = 0;
let cameraMode = 'main'; // 'main', 'front-pack', 'middle', 'back-pack', 'rear'

// Game speed control
let gameSpeed = 1;  // 1 = normal, 2 = 2x speed, 3 = 3x speed
window.gameSpeed = gameSpeed;
// Sprites
const horseSprite = new Image();
horseSprite.src = SPRITE_DEFAULTS.src;
// Horses
const palette = [
  "#8B0000","#FFD700","#4169E1","#FF4500","#2F4F4F","#32CD32","#9932CC","#FF69B4",
  "#00CED1","#D2691E","#E6E6FA","#DC143C","#708090","#FF6347","#9ACD32","#8A2BE2",
  "#00FA9A","#FFDAB9","#FF8C00","#1E90FF","#A0522D","#ADFF2F","#00BFFF","#20B2AA"
];
const horses = (window.HORSE_DATA || []).map((h, i) => ({
  name: h.name,
  color: h.color || palette[i % palette.length],
  lane: i + 1,
  x: START_X,
  y: laneOffset + i * laneGap,
  speed: 0,
  step: 0,
  animTime: 0,
  sprite: null,
  finished: false,
  finishTime: null,
  handicap: (h.handicap ?? null),
  hndp_race: (h.hndp_race ?? null),
  aver_hndp: (h.aver_hndp ?? null),
  wins: (h.wins ?? null),
  stats: {
    baseSpeed: Number(h.baseSpeed),
    stamina: Number(h.stamina),
    sprint: Number(h.sprint),
    variance: Number(h.variance),
    fatigue: Number(h.fatigue),
    kick: Number(h.kick),
    finalBoost: Number(h.finalBoost)
  },
  whipBoost: 1,
  whipTime: 0,
  whipFlash: 0
}));
// CRITICAL: Make horses globally available for strategies.js
window.horses = horses;
// CRITICAL: Expose all race state variables globally for strategies.js
window.raceActive = false;
window.raceFinished = false;
window.finishOrder = [];
window.finishLine = finishLine;
window.FURLONGS_TOTAL = FURLONGS_TOTAL;
window.START_X = START_X;
window.PPF = PPF;
// Global game state (for access from other modules)
window.gameState = {
  horses,
  cameraX,
  params: {
    VIEW_W,
    VIEW_H,
    worldWidth,
    laneGap,
    laneOffset,
    finishLine,
    FURLONGS_TOTAL,
    START_X
  }
};
// ===========================
// INITIALIZATION
// ===========================
function init() {
  console.log('🏇 Initializing Horse Racing Game...');
  
  // CRITICAL: Expose functions globally FIRST (before anything else loads)
  // These need to work even when called from strategies.js
  window.showResults = () => {
    const currentFinishOrder = window.finishOrder || [];
const currentRaceHistory = window.raceHistory || [];
    showWinnerModal(currentFinishOrder, currentRaceHistory);
  };
  
  window.refreshLeaderboard = () => {
    const currentHorses = window.horses || horses;
    const params = window.gameState?.params;
const currentRaceHistory = window.raceHistory || [];
    if (params) {
      refreshLeaderboard(currentHorses, params, currentRaceHistory);
    }
  };
  
  window.updateRaceResults = () => {
    const currentHorses = window.horses || horses;
    const currentFinishOrder = window.finishOrder || [];
    const currentRaceActive = window.raceActive || false;
    const currentRaceFinished = window.raceFinished || false;
    updateRaceResults(currentHorses, currentFinishOrder, currentRaceActive, currentRaceFinished);
  };
  
  // Initialize canvas
  initCanvas(VIEW_W, VIEW_H);
  
  // Initialize UI (HTML already exists in index.html)
  initSettingsPanel();
  initResultsPanel();
  setupUIToggle();
  setupStatsPanelDrag();
  
  // Setup sprite upload
  setupSpriteUpload(horses, () => {
    updateControlButtons(true, false);
    refreshLeaderboard(horses, window.gameState.params, raceHistory);
  });
  
  // Initialize player controls
  initPlayerControls();
  setupHorseSelection(horses, () => {
    actuallyStartRace(horses, playerSystem);
  });
  
const whipContainer = document.getElementById('whipCountContainer');
if (whipContainer) {
  whipContainer.appendChild(createWhipCountInput());
  console.log('✅ Whip count selector initialized');
} else {
  console.error('❌ whipCountContainer not found in HTML!');
}
  
  // Setup button handlers
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const downloadBtn = document.getElementById('downloadRaceHistoryBtn');
  const soundBtn = document.getElementById('toggleSound');
  
  if (startBtn) {
    startBtn.onclick = () => startRace(horses);
  }
  
  if (resetBtn) {
    resetBtn.onclick = () => {
      resetRace(horses, playerSystem, window.gameState.params);
    };
  }
  
   
  if (pauseBtn) {
    pauseBtn.onclick = togglePause;
  }
  
    if (downloadBtn) {
    downloadBtn.onclick = () => downloadRaceHistory(raceHistory);
  }
  
  if(soundBtn){
	  soundBtn.onclick = () => {
		  if(window.soundManager){
			  window.soundManager.toggle();
			        soundBtn.textContent = window.soundManager.enabled ? '🔊 Sound ON' : '🔇 Sound OFF';
		  }
	  };
	  
  }
  // Speed control buttons
const speed1xBtn = document.getElementById('speed1x');
const speed2xBtn = document.getElementById('speed2x');
const speed3xBtn = document.getElementById('speed3x');
const speed10xBtn = document.getElementById('speed10x');

if (speed1xBtn) {
  speed1xBtn.onclick = () => {
    gameSpeed = 1;
    console.log('Speed set to 1x');
  };
}

if (speed2xBtn) {
  speed2xBtn.onclick = () => {
    gameSpeed = 2;
    console.log('Speed set to 2x');
  };
}

if (speed3xBtn) {
  speed3xBtn.onclick = () => {
    gameSpeed = 3;
    console.log('Speed set to 3x');
  };
}

 if (speed10xBtn) {
  speed10xBtn.onclick = () => {
    window.gameSpeed = 10;
    gameSpeed = 10;
    console.log('Speed set to 10x');
  };
}



  

// Keyboard shortcuts
// Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    
    // ⭐ NEW: Arrow keys cycle through 5 camera modes
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const modes = ['main', 'front-pack', 'middle', 'back-pack', 'rear'];
      const currentIndex = modes.indexOf(cameraMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      cameraMode = modes[nextIndex];
      console.log(`📷 Camera: ${cameraMode.toUpperCase()}`);
    }
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const modes = ['main', 'front-pack', 'middle', 'back-pack', 'rear'];
      const currentIndex = modes.indexOf(cameraMode);
      const nextIndex = (currentIndex - 1 + modes.length) % modes.length;
      cameraMode = modes[nextIndex];
      console.log(`📷 Camera: ${cameraMode.toUpperCase()}`);
    }
    
    if (k === 'p' || k === ' ') {
      e.preventDefault();
      togglePause();
    }
  });
  
  
  // Sprite load handler
  horseSprite.onload = () => {
    const startBtn = document.getElementById('startBtn');
    const loadStatus = document.getElementById('loadStatus');
    if (startBtn) startBtn.disabled = false;
    if (loadStatus) loadStatus.textContent = "Sprites loaded. Ready to race!";
    console.log('✅ Default sprite loaded');
  };
  
  // Error handler - enable button anyway (will use fallback circles)
  horseSprite.onerror = () => {
    const startBtn = document.getElementById('startBtn');
    const loadStatus = document.getElementById('loadStatus');
    if (startBtn) startBtn.disabled = false;
    if (loadStatus) loadStatus.textContent = "Using fallback graphics. Ready to race!";
    console.warn('⚠️ Sprite failed to load, using fallback circles');
  };
  
  // Also enable if sprite already loaded (cached)
  if (horseSprite.complete) {
    const startBtn = document.getElementById('startBtn');
    const loadStatus = document.getElementById('loadStatus');
    if (startBtn) startBtn.disabled = false;
    if (loadStatus) loadStatus.textContent = "Sprites loaded. Ready to race!";
    console.log('✅ Default sprite already loaded');
  }
  
  // SAFETY: Enable button after 2 seconds regardless
  setTimeout(() => {
    const startBtn = document.getElementById('startBtn');
    if (startBtn && startBtn.disabled) {
      startBtn.disabled = false;
      const loadStatus = document.getElementById('loadStatus');
      if (loadStatus) loadStatus.textContent = "Ready to race!";
      console.log('⏰ Force-enabled Start button after timeout');
    }
  }, 2000);
  
  // Show initial UI
  refreshLeaderboard(horses, window.gameState.params, raceHistory);
  updateRaceHistory(raceHistory, horses, window.gameState.params);
  
  // Display race parameters
  showRaceParameters();
  
  console.log('✅ Game initialized');
}
/**
 * Show race parameters on screen briefly
 */
function showRaceParameters() {
  const paramInfo = document.createElement('div');
  paramInfo.style.cssText = `
    position:fixed;top:10px;left:50%;transform:translateX(-50%);
    background:rgba(0,0,0,0.8);color:lime;padding:10px;border-radius:8px;
    font-family:monospace;font-size:12px;z-index:9999;
  `;
  paramInfo.innerHTML = `
    ⚙️ Race Parameters:<br>
    World: ${worldWidth}px | Finish: ${finishLine}px<br>
    Canvas: ${VIEW_W}x${VIEW_H} | Lane Gap: ${laneGap}<br>
    🏁 Estimated Distance: <b>${FURLONGS_TOTAL} furlongs</b>
  `;
  document.body.appendChild(paramInfo);
  setTimeout(() => paramInfo.remove(), 5000);
}
// ===========================
// GAME LOOP
// ===========================
// Mid-race announcement
let midRaceAnnouncementDone = false; //middlevoice
function announceMidRacePositions() {
    // Only announce once, when race is 50% complete
    if (!midRaceAnnouncementDone && raceActive && !raceFinished) {
        
        // Check if lead horse is about halfway
        const leadHorse = horses.reduce((lead, h) => h.x > lead.x ? h : lead, horses[0]);
        const finishLine = worldWidth - 200;
        
        if (leadHorse.x >= finishLine * 0.5) { // 50% of race
            
            // Sort horses by current position (x coordinate)
            const sortedHorses = [...horses].sort((a, b) => b.x - a.x);
            
            // Announce top 6 positions
            for (let i = 0; i < Math.min(6, sortedHorses.length); i++) {
                const horse = sortedHorses[i];
                const position = i + 1;
                const horseFile = horse.name.replace(/ /g, "_");
                
                const positionWords = {
                    1: "first",
                    2: "second",
                    3: "third",
                    4: "fourth",
                    5: "fifth",
                    6: "sixth"
                };
                
                const positionWord = positionWords[position];
                
                // Stagger announcements
                const delay = i * 2500;
                
                setTimeout(() => {
                    window.soundManager.play(`sedat_name_${horseFile}`);
                    
                    setTimeout(() => {
                        window.soundManager.play(`sedat_position_${positionWord}`);
                    }, 1200);
                }, delay);
            }
            
            midRaceAnnouncementDone = true;
        }
    }
}
let lastTs = performance.now();
function gameLoop(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000) * gameSpeed;
  lastTs = ts;
  

// ⭐ NEW: Camera logic with five view modes
  if (raceActive || raceFinished) {
    let targetCameraX;
    const positions = horses.map(h => h.x).sort((a, b) => b - a); // Sorted fastest to slowest
    
    if (cameraMode === 'main') {
      // MAIN CAMERA: Show the leader
      const leader = positions[0];
      targetCameraX = Math.max(0, Math.min(worldWidth - VIEW_W, leader - VIEW_W * 0.4));
    } else if (cameraMode === 'front-pack') {
      // FRONT PACK: Show top 25% of horses
      const frontPackIndex = Math.floor(positions.length * 0.25);
      const frontPackX = positions[frontPackIndex];
      targetCameraX = Math.max(0, Math.min(worldWidth - VIEW_W, frontPackX - VIEW_W * 0.4));
    } else if (cameraMode === 'middle') {
      // MIDDLE CAMERA: Show the median position
      const medianX = positions[Math.floor(positions.length / 2)];
      targetCameraX = Math.max(0, Math.min(worldWidth - VIEW_W, medianX - VIEW_W * 0.5));
    } else if (cameraMode === 'back-pack') {
      // BACK PACK: Show bottom 25% of horses
      const backPackIndex = Math.floor(positions.length * 0.75);
      const backPackX = positions[backPackIndex];
      targetCameraX = Math.max(0, Math.min(worldWidth - VIEW_W, backPackX - VIEW_W * 0.6));
    } else {
      // REAR CAMERA: Show the slowest horse
      const slowest = positions[positions.length - 1];
      targetCameraX = Math.max(0, Math.min(worldWidth - VIEW_W, slowest - VIEW_W * 0.1));
    }
    
    cameraX += (targetCameraX - cameraX) * 0.1;
  } else {
    // Before race: keep camera at start to show horses
    cameraX = 0;
  }
  window.gameState.cameraX = cameraX;
  
  // Clear and draw
  ctx.save();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.translate(-cameraX, 0);
  
  drawTrack(window.gameState.params, horses);
  
  // Draw horses (sorted by Y position)
  const dtUsed = isPaused ? 0 : dt;
  horses.slice().sort((a, b) => a.y - b.y).forEach(h => {
    drawHorseSprite(h, dtUsed, horseSprite);
  });
  
  ctx.restore();
  
// ⭐ NEW: Display camera mode indicator
  if (raceActive || raceFinished) {
    ctx.save();
    
    const colors = {
      main: 'rgba(100, 255, 100, 0.8)',
      'front-pack': 'rgba(150, 255, 150, 0.8)',
      middle: 'rgba(255, 200, 100, 0.8)',
      'back-pack': 'rgba(255, 150, 100, 0.8)',
      rear: 'rgba(255, 100, 100, 0.8)'
    };
    
    const labels = {
      main: '📷 LEADER VIEW',
      'front-pack': '📷 FRONT PACK',
      middle: '📷 MIDDLE PACK',
      'back-pack': '📷 BACK PACK',
      rear: '📷 REAR VIEW'
    };
    
    ctx.fillStyle = colors[cameraMode];
    ctx.fillRect(10, 10, 220, 40);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(labels[cameraMode], 20, 35);
    ctx.restore();
  }
  
  // Update game state (if not paused)
  if (!isPaused && raceActive) {
    // Store previous positions
    horses.forEach(h => {
      h._prevX = h.x;
    });
    

    // Update global state for strategies.js
    window.raceActive = raceActive;
    window.raceFinished = raceFinished;
    window.finishOrder = finishOrder;
    
    // Run physics
    const updateFuncName = window.RACE_PARAMS?.update;
    const updateFunc = window[updateFuncName];
    if (typeof updateFunc === 'function') {
      updateFunc(dt)
console.log(`⚙️ Using update: ${updateFuncName}`);
    } else {
      console.error(`❌ Physics function "${updateFuncName}" not found!`);
    }
    
    // Update player system (whip boosts)
    updatePlayerSystem(dt, horses);
	
	  // Mid-race position announcement
    announceMidRacePositions();

    // Check for finishes
    horses.forEach(h => {
      handleHorseFinish(h, window.gameState.params);
    });
    
    // Update UI
    updateRaceResults(horses, finishOrder, raceActive, raceFinished);
    refreshLeaderboard(horses, window.gameState.params, raceHistory);
  }
  
  // Update HUD
  updateWhipHUD(playerSystem);
  
  // Listen for stats update requests
  window.addEventListener('updateStats', () => {
    updateCompleteStats();
  }, { once: true });
  
  requestAnimationFrame(gameLoop);
}

// ===========================
// START THE GAME
// ===========================

init();
requestAnimationFrame(gameLoop);

console.log('🏁 Game loop started!');
