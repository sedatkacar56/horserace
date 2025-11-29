// ===========================
// PURE ARRAY RACING SYSTEM
// With Race Strategy Modifiers (20% influence)
// ===========================

/**
 * Race Strategy Definitions
 * Each strategy distributes 100 points across furlongs
 * These points modify the base speed arrays by up to 20%
 */
const RACE_STRATEGIES = {
  'NONE': null, // No modification
  
  'AS_LAST_RACE': null, // Special case - handled separately
  
  'FAST_OUT_GATES': (length) => {
    // Front-load: 60% early, 40% late
    const arr = [];
    const earlyFurlongs = Math.ceil(length * 0.4);
    const earlyBonus = 60 / earlyFurlongs;
    const lateBonus = 40 / (length - earlyFurlongs);
    
    for (let i = 0; i < length; i++) {
      arr.push(i < earlyFurlongs ? earlyBonus : lateBonus);
    }
    return arr;
  },
  
  'TAKE_THE_LEAD': (length) => {
    // Aggressive first half: 70% first half, 30% second half
    const half = Math.ceil(length / 2);
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < half ? 70/half : 30/(length-half));
    }
    return arr;
  },
  
  'STEADY_PRESSURE': (length) => {
    // Even distribution
    const even = 100 / length;
    return Array(length).fill(even);
  },
  
  'TWO_FURLONGS_OUT': (length) => {
    // Save 70 points for last 2 furlongs
    if (length < 2) return Array(length).fill(100 / length);
    const arr = Array(length).fill(30 / (length - 2));
    arr[length - 2] = 35;
    arr[length - 1] = 35;
    return arr;
  },
  
  'SPRINT_FINAL_FURLONG': (length) => {
    // 70 points in final furlong only
    const arr = Array(length).fill(30 / (length - 1));
    arr[length - 1] = 70;
    return arr;
  },
  
  'BEGINNING_OF_RACE': (length) => {
    // Front 50% gets 75 points
    const half = Math.ceil(length / 2);
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < half ? 75/half : 25/(length-half));
    }
    return arr;
  },
  
  'END_OF_RACE': (length) => {
    // Back 50% gets 75 points
    const half = Math.ceil(length / 2);
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < half ? 25/half : 75/(length-half));
    }
    return arr;
  },
  
  'EVENLY_OVER_DISTANCE': (length) => {
    // Bell curve - peak in middle
    const arr = [];
    for (let i = 0; i < length; i++) {
      const progress = i / (length - 1);
      const bellCurve = Math.sin(progress * Math.PI);
      arr.push(bellCurve);
    }
    // Normalize to exactly 100
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.map(v => v * (100 / sum));
  },
  
  'RANDOM': (length) => {
    // Random distribution - each horse gets different random pattern
    const arr = Array(length).fill(0).map(() => Math.random());
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.map(v => v * (100 / sum));
  }
};

/**
 * Apply race strategy to horse's natural speed array
 * Strategy provides up to 20% influence on base values
 */
function applyRaceStrategy(horse, strategyName, totalFurlongs) {
  const strategyFunc = RACE_STRATEGIES[strategyName];
  if (!strategyFunc) {
    console.warn(`Unknown strategy: ${strategyName}`);
    return horse.baseSpeedArray || horse.speedArray;
  }
  
  // Get 100-point distribution (percentages)
  const bonusDistribution = strategyFunc(totalFurlongs);
  
  // Strategy can influence up to 20% of base value
  const MAX_STRATEGY_INFLUENCE = 0.20;
  
  const baseArray = horse.baseSpeedArray || horse.speedArray;
  const finalArray = baseArray.map((baseValue, idx) => {
    const bonusPercentage = bonusDistribution[idx] / 100; // 0 to 1
    
    // Calculate boost: base * 20% * bonus percentage
    // Example: base=6, bonus=50% → 6 * 0.2 * 0.5 = +0.6
    const strategyBoost = baseValue * MAX_STRATEGY_INFLUENCE * bonusPercentage;
    const finalValue = baseValue + strategyBoost;
    
    return Math.round(finalValue * 10) / 10;
  });
  
  return finalArray;
}

/**
 * Generate speed arrays with optional race strategy modification
 */
function generateSpeedArrays(horses, raceStrategy = 'NONE') {
  console.log('🎲 Generating speed arrays with strategy:', raceStrategy);
  
  const finishLine = window.RACE_PARAMS?.fl || 4500;
  const START_X = window.START_X || 50;
  const PPF = window.PPF || 1000;
  const totalFurlongs = window.FURLONGS_TOTAL || Math.round((finishLine - START_X) / PPF);
  
  console.log(`📏 Race: ${totalFurlongs} furlongs`);
  console.log('═══════════════════════════════════════');
  
  horses.forEach(h => {
    // Create BASE array (natural ability - random)
    h.baseSpeedArray = createSimpleArray(h.strategy, totalFurlongs);
    
    // Copy to speedArray
    h.speedArray = [...h.baseSpeedArray];
    
    // Apply race strategy modification (20% influence)
    if (raceStrategy && raceStrategy !== 'NONE') {
      h.speedArray = applyRaceStrategy(h, raceStrategy, totalFurlongs);
    }
    
    // Calculate total
    const total = h.speedArray.reduce((sum, val) => sum + val, 0);
    h.totalPenalty = total;
    
    // Display arrays
    console.log(`\n🐴 ${h.name} (${h.strategy})`);
    console.log(`   Base: [${h.baseSpeedArray.map(v => v.toFixed(1)).join(', ')}]`);
    if (raceStrategy && raceStrategy !== 'NONE') {
      console.log(`   +Strategy (${raceStrategy}): [${h.speedArray.map(v => v.toFixed(1)).join(', ')}]`);
      const diff = h.speedArray.map((v, i) => (v - h.baseSpeedArray[i]).toFixed(1));
      console.log(`   Difference: [${diff.join(', ')}]`);
    }
    console.log(`   Total: ${total.toFixed(1)}`);
  });
  
  console.log('\n═══════════════════════════════════════');
  
  // Show predicted order
  const sorted = [...horses].sort((a, b) => a.totalPenalty - b.totalPenalty);
  console.log('🏆 Predicted finish (by total):');
  sorted.forEach((h, i) => {
    console.log(`   ${i + 1}. ${h.name} (${h.totalPenalty.toFixed(1)})`);
  });
}

/**
 * Create completely random array
 * Ignores strategy - pure randomness for base values!
 */
function createSimpleArray(strategy, length) {
  const arr = [];
  
  for (let i = 0; i < length; i++) {
    // Completely random value between 2.0 and 9.0
    let value = 2.0 + (Math.random() * 7.0);
    
    // Round to 1 decimal
    value = Math.round(value * 10) / 10;
    
    arr.push(value);
  }
  
  return arr;
}

/**
 * Update horses - RANK-BASED SYSTEM
 * Ranks horses by array value each furlong, then assigns speeds by rank
 */
function updateHorses_array(dt) {
  if (!window.raceActive) return;
  
  const finishLine = window.finishLine || 4500;
  const START_X = window.START_X || 50;
  const PPF = window.PPF || 1000;
  
  const horses = window.horses || [];
  const finishOrder = window.finishOrder || [];
  
  // === RANK HORSES BY THEIR CURRENT FURLONG VALUE ===
  const activeHorses = horses.filter(h => !h.finished);
  
  if (activeHorses.length > 0) {
    // Get each horse's current array value
    const horseValues = activeHorses.map(h => {
      const distanceTraveled = h.x - START_X;
      const currentFurlong = Math.floor(distanceTraveled / PPF);
      const segment = Math.max(0, Math.min(h.speedArray.length - 1, currentFurlong));
      const arrayValue = h.speedArray[segment] || 1;
      
      return {
        horse: h,
        arrayValue: arrayValue,
        segment: segment
      };
    });
    
    // Sort by array value (HIGHEST = FASTEST)
    horseValues.sort((a, b) => b.arrayValue - a.arrayValue);
    
    // Assign speeds based on RANK
    const numHorses = horseValues.length;
    horseValues.forEach((hv, rank) => {
      // Rank 0 = fastest, rank N = slowest
      // Speed decreases gradually by rank
      const speedByRank = 5.0 - (rank * (2.0 / Math.max(1, numHorses - 1)));
      // This gives: 1st place = 5.0, last place = 3.0
      
      hv.horse.currentRank = rank + 1;
      hv.horse.rankSpeed = speedByRank;
    });
  }
  
  // === UPDATE POSITIONS ===
  horses.forEach(h => {
    if (h.finished) {
      // Slow down after finish
      if (h.x > finishLine + 100) {
        h.speed *= 0.95;
      }
      h.x += h.speed;
      return;
    }
    
    // Use rank-based speed
    let speed = h.rankSpeed || 3.0;
    
    // Apply whip boost if player horse
    if (h.whipBoost && h.whipBoost > 1) {
      speed *= h.whipBoost;
    }
    
    // Tiny random variation
    speed += (Math.random() - 0.5) * 0.2;
    
    h.speed = Math.max(0.5, speed);
    h.x += h.speed * dt * 43;
    
    // Check finish
    if (h.x >= finishLine && !h.finished) {
      h.finished = true;
      h.finishTime = performance.now();
      
      finishOrder.push({
        name: h.name,
        lane: h.lane,
        color: h.color,
        position: finishOrder.length + 1,
        strategy: h.strategy,
        handicap: h.handicap
      });
      
      console.log(`🏁 ${h.name} finished ${finishOrder.length}!`);
      
      if (finishOrder.length === horses.length) {
        window.raceFinished = true;
        window.raceActive = false;
        if (typeof window.showResults === 'function') {
          window.showResults();
        }
      }
    }
  });
  
  // Update UI
  if (typeof window.refreshLeaderboard === 'function') {
    window.refreshLeaderboard();
  }
  if (typeof window.updateRaceResults === 'function') {
    window.updateRaceResults();
  }
  if (typeof window.displaySpeedArrays === 'function') {
    window.displaySpeedArrays();
  }
}

/**
 * Display speed arrays on screen with hide/show and drag functionality
 */
function displaySpeedArrays() {
  const horses = window.horses || [];
  
  // Create or get display div
  let display = document.getElementById('array-display');
  if (!display) {
    display = document.createElement('div');
    display.id = 'array-display';
    display.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 0;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      max-height: 80vh;
      overflow: hidden;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(display);
    
    // Make it draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    
    display.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      
      isDragging = true;
      initialX = e.clientX - display.offsetLeft;
      initialY = e.clientY - display.offsetTop;
      display.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        display.style.left = currentX + 'px';
        display.style.top = currentY + 'px';
        display.style.right = 'auto';
      }
    });
    
    document.addEventListener('mouseup', function() {
      isDragging = false;
      display.style.cursor = 'grab';
    });
    
    display.style.cursor = 'grab';
  }
  
  // Check if content is hidden
  let contentDiv = document.getElementById('array-content');
  let isHidden = contentDiv && contentDiv.style.display === 'none';
  
  let html = `
    <div style="padding: 10px; background: rgba(0,0,0,0.3); display: flex; justify-content: space-between; align-items: center; user-select: none;">
      <h3 style="margin: 0;">📊 Speed Arrays</h3>
      <button id="toggle-arrays" style="
        background: #444;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      ">${isHidden ? 'Show' : 'Hide'}</button>
    </div>
    <div id="array-content" style="padding: 15px; max-height: 70vh; overflow-y: auto; display: ${isHidden ? 'none' : 'block'};">
  `;
  
  horses.forEach(h => {
    const currentFurlong = Math.floor((h.x - (window.START_X || 50)) / (window.PPF || 1000));
    
    html += `<div style="margin-bottom: 15px; border-left: 3px solid ${h.color}; padding-left: 8px;">`;
    html += `<strong>${h.name}</strong> (${h.strategy})<br>`;
    html += `Total: ${h.totalPenalty?.toFixed(1) || 'N/A'}<br>`;
    html += `Current Furlong: ${currentFurlong}<br>`;
    html += `Current Rank: ${h.currentRank || 'N/A'}<br>`;
    
    // Show base array if different from speed array
    if (h.baseSpeedArray && JSON.stringify(h.baseSpeedArray) !== JSON.stringify(h.speedArray)) {
      html += `Base: [${h.baseSpeedArray.map(v => v.toFixed(1)).join(', ')}]<br>`;
    }
    
    html += `Array: [`;
    
    // Show array with current position highlighted
    h.speedArray.forEach((val, idx) => {
      if (idx === currentFurlong) {
        html += `<span style="background: yellow; color: black; padding: 2px 4px; font-weight: bold;">${val.toFixed(1)}</span>`;
      } else {
        html += val.toFixed(1);
      }
      if (idx < h.speedArray.length - 1) html += ', ';
    });
    
    html += `]</div>`;
  });
  
  html += '</div>';
  
  display.innerHTML = html;
  
  // Add click handler for toggle button
  document.getElementById('toggle-arrays').addEventListener('click', function() {
    const content = document.getElementById('array-content');
    const isCurrentlyHidden = content.style.display === 'none';
    content.style.display = isCurrentlyHidden ? 'block' : 'none';
    this.textContent = isCurrentlyHidden ? 'Hide' : 'Show';
  });
}

/**
 * Download arrays as text file
 */
function downloadArrays() {
  const horses = window.horses;
  let text = '=== SPEED ARRAYS ===\n\n';
  
  horses.forEach(h => {
    text += `${h.name} (${h.strategy})\n`;
    if (h.baseSpeedArray) {
      text += `Base: [${h.baseSpeedArray.map(v => v.toFixed(1)).join(', ')}]\n`;
    }
    text += `Final: [${h.speedArray.map(v => v.toFixed(1)).join(', ')}]\n`;
    text += `Total: ${h.totalPenalty?.toFixed(1) || 'N/A'}\n\n`;
  });
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'speed_arrays.txt';
  a.click();
}

/**
 * Strategy assignment based on horse stats
 */
function assignRacingStrategies_array(horses) {
  const finishLine = window.RACE_PARAMS?.fl || 4500;
  const START_X = 50;
  
  const avg = {
    speed:   horses.reduce((a,b)=>a+b.stats.baseSpeed,0) / horses.length,
    stamina: horses.reduce((a,b)=>a+b.stats.stamina,0)   / horses.length,
    sprint:  horses.reduce((a,b)=>a+b.stats.sprint,0)    / horses.length
  };

  const scores = horses.map(h => {
    const r = {
      speed:   h.stats.baseSpeed / (avg.speed   || 1),
      stamina: h.stats.stamina   / (avg.stamina || 1),
      sprint:  h.stats.sprint    / (avg.sprint  || 1)
    };
    return {
      horse: h,
      scores: {
        FRONT_RUNNER: r.speed * 1.5 + r.stamina * 0.8 - r.sprint * 0.3,
        PRESSER:      r.speed * 1.1 + r.stamina * 1.0 + r.sprint * 0.8,
        STALKER:      3 - (Math.abs(r.speed-1) + Math.abs(r.stamina-1) + Math.abs(r.sprint-1)),
        CLOSER:       r.sprint * 1.6 + r.stamina * 1.1 - r.speed * 0.4
      }
    };
  });

  const STRATS = ['FRONT_RUNNER','PRESSER','STALKER','CLOSER'];
  const assigned = new Map();
  const used     = new Set();
  const n        = horses.length;

  function bestHorseFor(strategy) {
    const pick = scores
      .filter(s => !used.has(s.horse))
      .map(s => ({ horse: s.horse, score: s.scores[strategy] }))
      .sort((a,b) => b.score - a.score)[0];
    return pick || null;
  }

  if (n <= STRATS.length) {
    for (let i = 0; i < n; i++) {
      const st = STRATS[i];
      const pick = bestHorseFor(st);
      if (pick) { 
        assigned.set(pick.horse, st); 
        used.add(pick.horse); 
      }
    }
  } else {
    const base = Math.floor(n / STRATS.length);
    let rem    = n % STRATS.length;

    const stratStrength = STRATS.map(st => {
      const top = scores.map(s => s.scores[st]).sort((a,b)=>b-a)[0] ?? -Infinity;
      return { st, top };
    }).sort((a,b) => b.top - a.top);

    const targets = {};
    STRATS.forEach(st => targets[st] = base);
    for (let i = 0; i < rem; i++) targets[stratStrength[i].st] += 1;

    function assignedPer(st) {
      let c = 0; 
      for (const [,v] of assigned) if (v === st) c++; 
      return c;
    }

    for (const st of STRATS) {
      while (assignedPer(st) < targets[st]) {
        const pick = bestHorseFor(st);
        if (!pick) break;
        assigned.set(pick.horse, st);
        used.add(pick.horse);
      }
    }

    scores.forEach(s => {
      if (!assigned.has(s.horse)) {
        const best = Object.entries(s.scores).sort((a,b)=>b[1]-a[1])[0][0];
        assigned.set(s.horse, best);
        used.add(s.horse);
      }
    });
  }

  horses.forEach(h => { 
    h.strategy = assigned.get(h) || h.strategy || 'STALKER'; 
  });

  const dist = {};
  horses.forEach(h => dist[h.strategy] = (dist[h.strategy]||0)+1);
  console.log('📊 Strategy distribution:', dist);
  horses.forEach(h => console.log(`🐴 ${h.name.padEnd(20)} → ${h.strategy}`));
  
  if (typeof window.showStrategySummary === 'function') {
    window.showStrategySummary(horses);
  }
  
  return horses;
}

// Export functions
window.RACE_STRATEGIES = RACE_STRATEGIES;
window.applyRaceStrategy = applyRaceStrategy;
window.assignRacingStrategies_array = assignRacingStrategies_array;
window.generateSpeedArrays = generateSpeedArrays;
window.updateHorses_array = updateHorses_array;
window.downloadArrays = downloadArrays;
window.displaySpeedArrays = displaySpeedArrays;

console.log('✅ PURE ARRAY SYSTEM with Race Strategies loaded');
console.log('📋 Available strategies:', Object.keys(RACE_STRATEGIES).join(', '));
console.log('💡 Usage: generateSpeedArrays(horses, "SPRINT_FINAL_FURLONG")');
console.log('💡 Type downloadArrays() in console to save arrays');