// ===========================
// 2-PLAYER WHIP SYSTEM
// ===========================
console.log("YES");
window.whipUsed = false;
// 1- Player state
export const playerSystem = {
p1: { horse: null, whipsLeft: 10, spursLeft:3, pressuresLeft:5, cooldown: 0, spurCooldown:0, pressureCooldown:0, key:'w', spurKey:'q', pressureKey:'a',
          isAI: false  },
p2: { horse: null, whipsLeft: 10, spursLeft:3, pressuresLeft:5, cooldown: 0, spurCooldown:0, pressureCooldown:0, key:'i', spurKey:'o', pressureKey:'l',
          isAI: false  },
p3: { horse: null, whipsLeft: 10, spursLeft:3, pressuresLeft:5, cooldown: 0, spurCooldown:0, pressureCooldown:0, key:'b', spurKey:'v', pressureKey:'c',
          isAI: false  },

  enabled: false
};
// Expose globally for compatibility
window.playerSystem = playerSystem;
// 2- Initialize player controls (keyboard listeners
export function initPlayerControls() {
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    if (key === playerSystem.p1.key) {
		 window.whipUsed = true;
      useWhip('p1');
      flashHUD('p1');
    }
	
	if (key === playerSystem.p1.spurKey) {
    useSpur('p1');
    flashHUD('p1');
}
    
    if (key === playerSystem.p2.key) {
				 window.whipUsed = true;
      useWhip('p2');
      flashHUD('p2');
    }
	
	if (key === playerSystem.p2.spurKey) {
    useSpur('p2');
    flashHUD('p2');
}
	
	    if (key === playerSystem.p3.key) {
					 window.whipUsed = true;
      useWhip('p3');
      flashHUD('p3');
    }
	
	if (key === playerSystem.p3.spurKey) {
    useSpur('p3');
    flashHUD('p3');
}

// PRESSURE (new)
if (key === playerSystem.p1.pressureKey) {
    usePressure("p1");
    flashHUD("p1");
}
if (key === playerSystem.p2.pressureKey) {
    usePressure("p2");
    flashHUD("p2");
}
if (key === playerSystem.p3.pressureKey) {
    usePressure("p3");
    flashHUD("p3");
}

  });
  
}
// 3- useWhip
export function useWhip(slot) {
  const raceActive = window.raceActive || false;
  if (!raceActive) return;
  
  const p = playerSystem[slot];
  if (!p) return;
  
  // Check if horse is assigned
  if (!p.horse) {
    console.log(`${slot}: No horse selected!`);
    return;
  }
  
  // Check whips remaining
  if (p.whipsLeft <= 0) {
    console.log(`${slot}: No whips left`);
    return;
  }
  
  
  
  // Check cooldown
  if (p.cooldown > 0) {
    console.log(`${slot}: On cooldown (${p.cooldown.toFixed(1)}s)`);
    return;
  }
  
 
   
  // Apply whip boost
  p.whipsLeft--;
  p.cooldown = 2.5; // seconds before next whip
  p.horse.whipBoost = 1.25; // +25% speed
  p.horse.whipTime = 1.5; // lasts 1.5 seconds
  p.horse.whipFlash = 0.5; // visual flash effect
  
  




  
  
  // ⭐ PLAY SOUND ONLY IF WHIP SUCCEEDS ⭐
window.soundManager.stop('whip');
window.soundManager.play('whip');

}
export function useSpur(slot) {
  if (!window.raceActive) return;

  const p = playerSystem[slot];
  if (!p) return;
  if (!p.horse) return;

  if (p.spursLeft <= 0) {
    console.log(`${slot}: No spurs left`);
    return;
  }

  if (p.spurCooldown > 0) {
    console.log(`${slot}: Spur cooldown (${p.spurCooldown.toFixed(1)}s)`);
    return;
  }

  const h = p.horse;

  // Apply spur boost
  p.spursLeft--;
  p.spurCooldown = 5.0;

  h.spurBoost = 1.6;  // +60% speed
  h.spurTime = 1.2;   // lasts 1.2 seconds
  h.spurFlash = 0.4;  // visual effect

console.log("Spur Cooldown:", playerSystem.p1.spurCooldown);

  console.log(`⚡ ${slot} spurred ${h.name} (spurs left: ${p.spursLeft})`);
}
  // ⭐ PLAY SOUND ONLY IF WHIP SUCCEEDS ⭐
window.soundManager.stop('spur');
window.soundManager.play('spur');
// 4- usePressure
export function usePressure(slot) {

    if (!window.raceActive) return;
    const p = playerSystem[slot];
    if (!p || !p.horse) return;

    if (p.pressuresLeft <= 0) {
        console.log(slot + ": No pressures left");
        return;
    }

    if (p.pressureCooldown > 0) {
        console.log(slot + ": Pressure cooldown (" + p.pressureCooldown.toFixed(1) + "s)");
        return;
    }

    const h = p.horse;

    // Find nearest horse ahead
    let target = null;
    let minDist = Infinity;

    for (const o of window.horses) {
        if (o === h) continue;
        if (o.x > h.x) {
            const d = o.x - h.x;
            if (d < minDist) {
                minDist = d;
                target = o;
            }
        }
    }

    // Check range (1 horse length = 40px)
    if (!target || minDist > 200) {
        console.log("❌ Too far: Need to be within 1 horse length");
        return;
    }

    // Apply slowdown
    target.pressureBoost = 0.70; // reduce speed by 15%
    target.pressureTime = 4.0;   // lasts 1.2s
    target.pressureFlash = 0.5;

    p.pressuresLeft--;
    p.pressureCooldown = 4.0; // 4 seconds cooldown

    console.log(`🔵 PRESSURE by ${slot} → slowing ${target.name}`);
}
// 5- Update player system (called every frame)
export function updatePlayerSystem(dt, horses) {
  if (!playerSystem.enabled) return;

  // WHIP cooldowns
  playerSystem.p1.cooldown = Math.max(0, playerSystem.p1.cooldown - dt);
  playerSystem.p2.cooldown = Math.max(0, playerSystem.p2.cooldown - dt);
  playerSystem.p3.cooldown = Math.max(0, playerSystem.p3.cooldown - dt);

  // SPUR cooldowns
  playerSystem.p1.spurCooldown = Math.max(0, playerSystem.p1.spurCooldown - dt);
  playerSystem.p2.spurCooldown = Math.max(0, playerSystem.p2.spurCooldown - dt);
  playerSystem.p3.spurCooldown = Math.max(0, playerSystem.p3.spurCooldown - dt);

  // PRESSURE cooldowns (corrected)
  playerSystem.p1.pressureCooldown = Math.max(0, playerSystem.p1.pressureCooldown - dt);
  playerSystem.p2.pressureCooldown = Math.max(0, playerSystem.p2.pressureCooldown - dt);
  playerSystem.p3.pressureCooldown = Math.max(0, playerSystem.p3.pressureCooldown - dt);

    // =============================
    //  RUN AI FOR AI PLAYERS
    // =============================
    ["p1","p2","p3"].forEach(slot => {
        const p = playerSystem[slot];
        if (p && p.isAI && p.horse) {
            runAI(slot, p, dt);
        }
    });
	
	// =================================
// AI for horses WITHOUT a user
// =================================
window.aiHorses.forEach(h => {
    runStandaloneAI(h, dt);
});


  // Apply whip boosts to horses
  horses.forEach(h => {

    // Remember position before physics
    if (h.whipTime > 0 && h.whipBoost > 1) {
      const dx = Math.max(0, h.x - (h._prevX || h.x));
      if (dx > 0) {
        h.x += dx * (h.whipBoost - 1);
      }
      
      h.whipTime -= dt;
      if (h.whipTime <= 0) {
        h.whipTime = 0;
        h.whipBoost = 1;
      }
    }
    
    // Update flash effect
    if (h.whipFlash > 0) {
      h.whipFlash -= dt;
      if (h.whipFlash < 0) h.whipFlash = 0;
    }
	
	// Spur boost
if (h.spurTime > 0 && h.spurBoost > 1) {
    const dx = Math.max(0, h.x - (h._prevX || h.x));
    if (dx > 0) {
        h.x += dx * (h.spurBoost - 1);
    }

    h.spurTime -= dt;
    if (h.spurTime <= 0) {
        h.spurTime = 0;
        h.spurBoost = 1;
    }
}

// Spur flash fade
if (h.spurFlash > 0) {
    h.spurFlash -= dt;
    if (h.spurFlash < 0) h.spurFlash = 0;
}

// ▼▼ PRESSURE (slowdown) ▼▼
 if (h.pressureTime > 0 && h.pressureBoost < 1) {

    const dx = Math.max(0, h.x - (h._prevX || h.x));
    if (dx > 0) {
        h.x -= dx * (1 - h.pressureBoost); // slow down
    }

    h.pressureTime -= dt;
    if (h.pressureTime <= 0) {
        h.pressureTime = 0;
        h.pressureBoost = 1;
    }
}






// pressure flash fade
if (h.pressureFlash > 0) {
    h.pressureFlash -= dt;
    if (h.pressureFlash < 0) h.pressureFlash = 0;
}



  });
}
// 6- SIMPLE AI CONTROLLER
export function runAI(slot, p, dt) {

    // AI should sometimes wait (feels more natural)
    if (!p._aiTimer) p._aiTimer = 0;
    p._aiTimer -= dt;
    if (p._aiTimer > 0) return;

    // random delay before next action (0.8s – 2.2s)
    p._aiTimer = 0.8 + Math.random() * 1.4;

    const h = p.horse;

    if (!h) return;

    // =============== WHIP LOGIC ===============
    if (p.whipsLeft > 0 && p.cooldown <= 0) {
        if (Math.random() < 0.25) {  // 25% chance
            useWhip(slot);
            return;
        }
    }

    // =============== SPUR LOGIC ===============
    if (p.spursLeft > 0 && p.spurCooldown <= 0) {
        if (Math.random() < 0.15) {  // 15% chance
            useSpur(slot);
            return;
        }
    }

    // =============== PRESSURE LOGIC ===============
    if (p.pressuresLeft > 0 && p.pressureCooldown <= 0) {
        if (Math.random() < 0.20) { // 20% chance
            usePressure(slot);
            return;
        }
    }
}

export function runStandaloneAI(h, dt) {

    if (!h) return;

    // Create timer for natural behavior
    if (!h._aiTimer) h._aiTimer = 0;
    h._aiTimer -= dt;
    if (h._aiTimer > 0) return;

    h._aiTimer = 0.8 + Math.random() * 1.4;

    // EARLY RACE
    const finishLine = window.RACE_PARAMS?.fl || 4500;
    const progress = h.x / finishLine;

    // WHIP
    if (h.whipsLeft > 0 && h.whipCooldown <= 0) {
        if (Math.random() < 0.25) {
            h.whipsLeft--;
            h.whipCooldown = 2.5;
            h.whipBoost = 1.25;
            h.whipTime = 1.5;
            h.whipFlash = 0.4;
        }
    }

    // SPUR
    if (h.spursLeft > 0 && h.spurCooldown <= 0) {
        if (progress > 0.7 && Math.random() < 0.18) {
            h.spursLeft--;
            h.spurCooldown = 5.0;
            h.spurBoost = 1.6;
            h.spurTime = 1.2;
            h.spurFlash = 0.4;
        }
    }

    // PRESSURE
    if (h.pressuresLeft > 0 && h.pressureCooldown <= 0) {

        // Find nearest ahead
        let nearest = null;
        let minDist = Infinity;

        for (const o of window.horses) {
            if (o === h) continue;
            if (o.x > h.x) {
                const d = o.x - h.x;
                if (d < minDist) {
                    minDist = d;
                    nearest = o;
                }
            }
        }

        if (nearest && minDist < 120 && Math.random() < 0.33) {
            h.pressuresLeft--;
            h.pressureCooldown = 4.0;
            nearest.pressureBoost = 0.70;
            nearest.pressureTime = 3.0;
            nearest.pressureFlash = 0.5;
        }
    }
}



// 7- Flash HUD
/**
 * Flash HUD when whip is used
 */
function flashHUD(slot) {
  const hud = document.querySelector(`.hud.${slot}`);
  if (hud) {
    hud.style.transform = 'scale(1.1)';
    setTimeout(() => hud.style.transform = 'scale(1)', 200);
  }
}
// 8- setupHorseSelection
/**
 * Sets up horse selection UI for players before race starts.
 * Loads saved selections from localStorage, validates no duplicate horses,
 * assigns horses/AI settings to player slots, and triggers the race callback.
 * @param {Array<Object>} horses - Array of available horse objects
 * @param {Function} startRaceCallback - Function called when race should begin
 */
export function setupHorseSelection(horses, startRaceCallback) {
  const confirmBtn = document.getElementById('confirmSelection');
  const cancelBtn = document.getElementById('cancelSelection');
  const p1Select = document.getElementById('p1HorseSelect');
  const p2Select = document.getElementById('p2HorseSelect');
  const p3Select = document.getElementById('p3HorseSelect');
  const selectionPanel = document.getElementById('horseSelection');
    const ai1 = document.getElementById("p1AI");
const ai2 = document.getElementById("p2AI");
const ai3 = document.getElementById("p3AI");
  
  // ------------------------------------------
  // 💾 Load previous horse selections
  // ------------------------------------------
  function loadSavedSelections() {
    try {
      const savedData = localStorage.getItem("selectedHorses");
      
      if (!savedData) {
        console.log("❌ No saved data found");
        return;
      }
      
      const saved = JSON.parse(savedData);
      
      // Check if dropdowns have options
      if (p1Select) {
              // List all option values
        for (let i = 0; i < p1Select.options.length; i++) {
          console.log(`  Option ${i}: value="${p1Select.options[i].value}"`);
        }
      }
      
      // Restore dropdown values
      if (saved.p1 && saved.p1 !== "" && p1Select) {
        p1Select.value = saved.p1;
      }
      if (saved.p2 && saved.p2 !== "" && p2Select) {
        p2Select.value = saved.p2;
      }
      if (saved.p3 && saved.p3 !== "" && p3Select) {
        p3Select.value = saved.p3;
      }
      
      // Auto-assign playerSystem horses
      if (saved.p1 && saved.p1 !== "") {
        const index = parseInt(saved.p1);
        if (horses[index]) {
          playerSystem.p1.horse = horses[index];
        }
      }
      if (saved.p2 && saved.p2 !== "") {
        const index = parseInt(saved.p2);
        if (horses[index]) {
          playerSystem.p2.horse = horses[index];
        }
      }
      if (saved.p3 && saved.p3 !== "") {
        const index = parseInt(saved.p3);
        if (horses[index]) {
          playerSystem.p3.horse = horses[index];
        }
      }
      
      if ((saved.p1 && saved.p1 !== "") || (saved.p2 && saved.p2 !== "") || (saved.p3 && saved.p3 !== "")) {
        playerSystem.enabled = true;
      }
    } catch (error) {
      console.error("❌ Error loading saved selections:", error);
    }
  }
  
  // Load immediately
  loadSavedSelections();
  
  // Also try after delays
  setTimeout(() => {
    console.log("⏰ Retry after 100ms");
    loadSavedSelections();
  }, 100);
  
  setTimeout(() => {
    console.log("⏰ Retry after 500ms");
    loadSavedSelections();
  }, 500);
  
  // ------------------------------------------
  // CONFIRM SELECTION BUTTON
  // ------------------------------------------
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      const p1Index = p1Select?.value || "";
      const p2Index = p2Select?.value || "";
      const p3Index = p3Select?.value || "";
         
      // Prevent selecting same horse
      const chosen = [p1Index, p2Index, p3Index].filter(x => x !== "");
      const hasDuplicates = new Set(chosen).size !== chosen.length;
      
      if (hasDuplicates) {
        alert("⚠ Players cannot choose the same horse!");
        return;
      }
      
      // Make sure at least one horse is selected
      if (chosen.length === 0) {
        alert("⚠ Please select at least one horse!");
        return;
      }
      
      // Assign
      playerSystem.p1.horse = p1Index && p1Index !== "" ? horses[parseInt(p1Index)] : null;
      playerSystem.p2.horse = p2Index && p2Index !== "" ? horses[parseInt(p2Index)] : null;
      playerSystem.p3.horse = p3Index && p3Index !== "" ? horses[parseInt(p3Index)] : null;
      
	  // ===========================
// AUTO-AI FOR UNSELECTED HORSES
// ===========================
window.aiHorses = [];

horses.forEach((h, index) => {
    const selected = 
        index === parseInt(p1Index) ||
        index === parseInt(p2Index) ||
        index === parseInt(p3Index);

    if (!selected) {
        window.aiHorses.push(h);
        h.ai = true;

        // Give AI its own internal ability counters!
        h.whipsLeft = 8;
        h.spursLeft = 2;
        h.pressuresLeft = 4;

        h.whipCooldown = 0;
        h.spurCooldown = 0;
        h.pressureCooldown = 0;
    }
});

	  
	    // ⭐ ADD THESE 3 LINES RIGHT HERE ⭐
      playerSystem.p1.isAI = ai1.checked;
      playerSystem.p2.isAI = ai2.checked;
      playerSystem.p3.isAI = ai3.checked;
	  
      // Save to localStorage
      const selectionsToSave = {
        p1: p1Index,
        p2: p2Index,
        p3: p3Index
      };
      
      localStorage.setItem("selectedHorses", JSON.stringify(selectionsToSave));
      
      playerSystem.enabled = !!(p1Index || p2Index || p3Index);
      selectionPanel.style.display = "none";
      
      // Apply whip amounts
      const mode = document.getElementById("whipMode")?.value;
      if (mode === "global") {
        const globalWhips = getWhipCountFromInput();
        playerSystem.p1.whipsLeft = globalWhips;
        playerSystem.p2.whipsLeft = globalWhips;
        playerSystem.p3.whipsLeft = globalWhips;
      } else {
        playerSystem.p1.whipsLeft = parseInt(document.getElementById("p1WhipInput")?.value) || 10;
        playerSystem.p2.whipsLeft = parseInt(document.getElementById("p2WhipInput")?.value) || 10;
        playerSystem.p3.whipsLeft = parseInt(document.getElementById("p3WhipInput")?.value) || 10;
      }
      
      startRaceCallback();
    };
  }
  
  // CANCEL BTN
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      playerSystem.enabled = false;
      selectionPanel.style.display = "none";
      startRaceCallback();
    };
  }
}
// 9- autoPlayerLogic
function autoPlayerLogic(dt) {
    if (!window.raceActive) return;

    ["p1", "p2", "p3"].forEach(slot => {
        const p = playerSystem[slot];

        if (!p || !p.horse) return;
        if (!p.isAI) return;   // ← only AI players act

        // Random whip usage
        if (p.whipsLeft > 0 && p.cooldown <= 0) {
            if (Math.random() < 0.02) {
                useWhip(slot);
            }
        }

        // Random spur usage
        if (p.spursLeft > 0 && p.spurCooldown <= 0) {
            if (Math.random() < 0.01) {
                useSpur(slot);
            }
        }

        // Pressure logic (must have horse ahead)
        if (p.pressuresLeft > 0 && p.pressureCooldown <= 0) {
            let ahead = false;

            for (const h of window.horses) {
                if (h !== p.horse && h.x > p.horse.x && (h.x - p.horse.x) < 180) {
                    ahead = true;
                }
            }

            if (ahead && Math.random() < 0.03) {
                usePressure(slot);
            }
        }
    });
}
