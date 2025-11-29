
// ===========================
// RACE MANAGEMENT
// ===========================


import { updateRaceResults, showWinnerModal } from '../ui/race-results.js';
import { refreshLeaderboard } from '../ui/leaderboard.js';
import { getWhipCountFromInput } from '../ui/controls-ui.js';
console.log('✅✅✅ YES9✅✅✅');  // ← Make it VERY visible

// Race state
export let raceActive = false;
export let raceFinished = false;
export let isPaused = false;
export let finishOrder = [];
export let raceHistory = [];
export let raceNumber = 0;

// Expose to window for track.js access
window.raceActive = raceActive;
window.raceFinished = raceFinished;
const Whipselection = document.getElementById('whipCountContainer');
/**
 * Start the race (shows horse selection panel)
 */
export function startRace(horses) {
  
  if (raceActive) return;
  
  // Show horse selection panel
  const selectionPanel = document.getElementById('horseSelection');
  const p1Select = document.getElementById('p1HorseSelect');
  const p2Select = document.getElementById('p2HorseSelect');
  const p3Select = document.getElementById('p3HorseSelect');
  
  // Populate dropdowns
  p1Select.innerHTML = '<option value="">Choose horse...</option>';
  p2Select.innerHTML = '<option value="">Choose horse...</option>';
  p3Select.innerHTML = '<option value="">Choose horse...</option>';
  
  horses.forEach((h, i) => {
    p1Select.innerHTML += `<option value="${i}">${h.name} (Lane ${h.lane})</option>`;
    p2Select.innerHTML += `<option value="${i}">${h.name} (Lane ${h.lane})</option>`;
    p3Select.innerHTML += `<option value="${i}">${h.name} (Lane ${h.lane})</option>`;
  });
  
  // 💾 RESTORE SAVED SELECTIONS
  try {
    const saved = JSON.parse(localStorage.getItem("selectedHorses") || "{}");
    if (saved.p1 && saved.p1 !== "") p1Select.value = saved.p1;
    if (saved.p2 && saved.p2 !== "") p2Select.value = saved.p2;
    if (saved.p3 && saved.p3 !== "") p3Select.value = saved.p3;
    console.log("✅ Restored dropdown selections:", saved);
  } catch (error) {
    console.error("Error restoring selections:", error);
  }
  
  selectionPanel.style.display = 'block';
}

/**
 * Actually start the race (called after horse selection)
 */
export function actuallyStartRace(horses, playerSystem) {
  raceActive = true;
  raceFinished = false;
  
  if(Whipselection) Whipselection.style.display = 'none';
  
  // 🔥 Set whips based on input when race actually starts
 // Read whip mode
const whipMode = document.getElementById("whipMode")?.value;

// Default values
let w1 = 10, w2 = 10, w3 = 10;

if (whipMode === "global") {
  // Use shared input
  const shared = getWhipCountFromInput();
  w1 = w2 = w3 = shared;

} else if (whipMode === "custom") {
  // Use individual inputs
  const i1 = document.getElementById("p1WhipInput");
  const i2 = document.getElementById("p2WhipInput");
  const i3 = document.getElementById("p3WhipInput");

  w1 = parseInt(i1?.value || 10);
  w2 = parseInt(i2?.value || 10);
  w3 = parseInt(i3?.value || 10);
}

// Apply whips
playerSystem.p1.whipsLeft = w1;
playerSystem.p2.whipsLeft = w2;
playerSystem.p3.whipsLeft = w3;

console.log(`⭐ Whips: P1=${w1}, P2=${w2}, P3=${w3}`);

// ⚡ Reset spurs (NEW - ADD THIS SECTION)
  playerSystem.p1.spursLeft = 3;
  playerSystem.p1.spurCooldown = 0;
  playerSystem.p2.spursLeft = 3;
  playerSystem.p2.spurCooldown = 0;
  playerSystem.p3.spursLeft = 3;
  playerSystem.p3.spurCooldown = 0;
  console.log("⚡ Spurs reset: All players have 3 spurs");
  
  // Reset spur penalties on horses (NEW - ADD THIS TOO)
  horses.forEach(h => {
    h._spurBoostTimer = 0;
    h._spurFatiguePenalty = 0;
  });
  

  
  isPaused = false;
  finishOrder = [];
  window.raceStartTime = performance.now();
  
  // Update window references
  window.raceActive = true;
  window.raceFinished = false;
  
  // Reset horses
  horses.forEach(h => {
    h.finished = false;
    h.finishTime = null;
    h._lateKickUsed = false;
    h._finalBoostUsed = false;
    h._kickTimer = 0;
    h._kickCooldown = 0;
  });
  
  // Assign racing strategies
  const strategyFuncName = window.RACE_PARAMS?.strategy || 'assignRacingStrategies_sedat';
  const strategyFunc = window[strategyFuncName];
  
  if (typeof strategyFunc === 'function') {
    strategyFunc(horses);
    console.log(`✅ Using strategy: ${strategyFuncName}`);
  } else {
    console.error(`❌ Strategy function "${strategyFuncName}" not found!`);
    if (typeof window.assignRacingStrategies_sedat === 'function') {
      window.assignRacingStrategies_sedat(horses);
      console.log('⚠️ Falling back to assignRacingStrategies_sedat');
    }
  }
  
  // ⭐ Generate speed arrays if using array system
  if (typeof window.generateSpeedArrays === 'function') {
    window.generateSpeedArrays(horses);
    console.log('✅ Speed arrays generated');
  }
  
  // Update UI
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const winnerEl = document.getElementById('winner');
  
  if (startBtn) startBtn.disabled = true;
  if (resetBtn) resetBtn.disabled = true;
  if (pauseBtn) {
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
  }
  if (winnerEl) winnerEl.style.display = 'none';
  
  updateRaceResults(horses, finishOrder, raceActive, raceFinished);
  
  console.log('🏁 Race started!');
  
  // Start race sounds
  if (window.soundManager) {
    window.soundManager.play('start');  // Play start sound first
    
	setTimeout(() => {
  window.soundManager.play("sedat_start");
}, 7000); // Delay until trumpet finishes

    // Start gallop and crowd after 7 seconds
    setTimeout(() => {
      if (window.soundManager && window.raceActive) {
        window.soundManager.play('gallop', true);    // Loop galloping
        // window.soundManager.play('crowd', true, 55); // Loop crowd with 35 second gap
      }
    }, 7000);
  }
  }


window.actuallyStartRace = actuallyStartRace;
/**

 * Reset the race
 */
export function resetRace(horses, playerSystem, params) {
  // Reset player system
  const whipCount = getWhipCountFromInput();
  
  if(whipselection) Whipselection.style.display = 'block';
  // Reset player system
  playerSystem.enabled = false;
  playerSystem.p1.whipsLeft = whipCount;  // ⭐ Dynamic
  playerSystem.p1.cooldown = 0;
  playerSystem.p2.whipsLeft = whipCount;  // ⭐ Dynamic
  playerSystem.p2.cooldown = 0;
    playerSystem.p3.whipsLeft = whipCount;  // ⭐ Dynamic
  playerSystem.p3.cooldown = 0;
  
  console.log(`🏇 Race reset with ${whipCount} whips per player`);
  
  // Reset race state
  raceActive = false;
  raceFinished = false;
  isPaused = false;
  finishOrder = [];
  
  // Update window references
  window.raceActive = false;
  window.raceFinished = false;
  
  // Reset camera
  if (window.gameState) {
    window.gameState.cameraX = 0;
  }
  
  // Reset horses
  horses.forEach(h => {
    h.x = 50;
    h.speed = 0;
    h.step = 0;
    h.animTime = 0;
    h.y = params.laneOffset + (h.lane - 1) * params.laneGap;
    h._kickTimer = 0;
    h._kickCooldown = 0;
    h._finalBoostUsed = false;
    h._lateKickUsed = false;
    h.finished = false;
    h.finishTime = null;
  });
  
  // Update UI
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const winnerEl = document.getElementById('winner');
  const raceResults = document.getElementById('raceResults');
  
  if (startBtn) startBtn.disabled = false;
  if (resetBtn) resetBtn.disabled = true;
  if (pauseBtn) {
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
  }
  if (winnerEl) winnerEl.style.display = 'none';
  if (raceResults) raceResults.style.display = 'none';
  
  refreshLeaderboard(horses, params, raceHistory);
  
  console.log('🔄 Race reset');
  
    
  // Stop all sounds
  if (window.soundManager) {
    window.soundManager.stopAll();
  }
  
}

/**
 * Toggle pause state
 */
export function togglePause() {
  if (!raceActive && !raceFinished) return;
  
  isPaused = !isPaused;
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  }
  
  // Pause/resume sounds
  if (window.soundManager) {
    if (isPaused) {
      window.soundManager.stop('gallop');
      window.soundManager.stop('crowd');
    } else {
      window.soundManager.play('gallop');
      // window.soundManager.play('crowd', true, 35);
    }
  }
  
  console.log(isPaused ? '⏸️ Paused' : '▶️ Resumed');
}
/**
 * Shuffle horse lanes randomly
 */
export function shuffleLanes(horses, params) {
  const ids = horses.map((_, i) => i + 1).sort(() => Math.random() - 0.5);
  horses.forEach((h, i) => {
    h.lane = ids[i];
    h.y = params.laneOffset + (h.lane - 1) * params.laneGap;
  });
  refreshLeaderboard(horses, params, raceHistory);
  console.log('🔀 Lanes shuffled');
}

/**
 * Handle horse finishing
 */
export function handleHorseFinish(horse, params) {
  // Check if crossed finish line AND not already finished
  if (horse.x >= params.finishLine && !horse.finished) {
    console.log('🟢 Horse crossed finish line!', horse.name);
    horse.finished = true;
    horse.finishTime = performance.now();
    finishOrder.push(horse);
    
    console.log(`🏁 ${horse.name} finished in position ${finishOrder.length}`);
    console.log('  Calling checkRaceComplete()...');
    
    checkRaceComplete();
  }
}


/**
 * Check if all horses have finished
 */
function checkRaceComplete() {

  const horses = window.gameState?.horses || [];
  const allFinished = horses.every(h => h.finished);
  
  if (allFinished && !raceFinished) {
    raceFinished = true;
    window.raceFinished = true;
	  console.log('🎵 About to play finish sound');  // ← ADD THIS

    
    // Save race results
    saveRaceResults(horses);
    
	
	   // Play finish sound
    if (window.soundManager) {
		 console.log('🎵 Sound manager exists');  // ← ADD THIS
    console.log('🎵 Stopping gallop and crowd');  // ← ADD THIS
      window.soundManager.stop('gallop');
	      window.soundManager.stop('crowd');
    console.log('🎵 Playing finish sound');  // ← ADD THIS

      window.soundManager.play('finish');
	}else{
		    console.log('❌ Sound manager NOT found!');  // ← ADD THIS

	}
	
    
	
    // Show results
    showWinnerModal(finishOrder, raceHistory);
    
    const resetBtn = document.getElementById('resetBtn');
    const startBtn = document.getElementById('startBtn');
    if (resetBtn) resetBtn.disabled = false;
    if (startBtn) startBtn.disabled = true;
    
    console.log('🏆 Race complete!');
  }
}

/**
 * Save race results to history
 */
function saveRaceResults(horses) {

  raceNumber = 1;
  raceHistory.length = 0; // clear old
raceHistory.push({
  raceNum: raceNumber,
  results: finishOrder.map((h, i) => ({
    position: i + 1,
    name: h.name,
    lane: h.lane,
    color: h.color,
    handicap: h.handicap,
    hndp_race: h.hndp_race,
    aver_hndp: h.aver_hndp,
    wins: h.wins
  }))
});


  window.raceHistory = raceHistory;  // ⭐ ADD THIS LINE!

  refreshLeaderboard(horses, window.gameState?.params, raceHistory);
}

/**
 * Update exported state (called from game loop)
 */
export function updateRaceState() {
  window.raceActive = raceActive;
  window.raceFinished = raceFinished;
}