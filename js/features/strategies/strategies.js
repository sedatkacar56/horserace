function assignRacingStrategies_pack(horses) {
  const finishLine = window.RACE_PARAMS?.fl || 4500;
  const START_X = 50;
  
  const avg = {
    speed: horses.reduce((a,b)=>a+b.stats.baseSpeed,0) / horses.length,
    stamina: horses.reduce((a,b)=>a+b.stats.stamina,0) / horses.length,
    sprint: horses.reduce((a,b)=>a+b.stats.sprint,0) / horses.length
  };
  
  const raceLength = finishLine - START_X;
  const isShort = raceLength < 6750;
  const isLong = raceLength > 10125;
  
  const scores = horses.map(h => {
    const r = {
      speed: h.stats.baseSpeed / (avg.speed || 1),
      stamina: h.stats.stamina / (avg.stamina || 1),
      sprint: h.stats.sprint / (avg.sprint || 1)
    };
    return {
      horse: h,
      scores: {
        FRONT_RUNNER: r.speed * 1.5 + r.stamina * 0.8 - r.sprint * 0.3,
        PRESSER: r.speed * 1.1 + r.stamina * 1.0 + r.sprint * 0.8,
        STALKER: 3 - (Math.abs(r.speed-1) + Math.abs(r.stamina-1) + Math.abs(r.sprint-1)),
        CLOSER: r.sprint * 1.6 + r.stamina * 1.1 - r.speed * 0.4
      }
    };
  });
  
  const STRATS = ['FRONT_RUNNER','PRESSER','STALKER','CLOSER'];
  const assigned = new Map();
  const used = new Set();
  const n = horses.length;
  
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
    let rem = n % STRATS.length;
    
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
    h.strategy = assigned.get(h) || h.strategy;
  });
  
  horses.forEach(h => {
    const r = {
      speed: h.stats.baseSpeed / (avg.speed || 1),
      stamina: h.stats.stamina / (avg.stamina || 1),
      sprint: h.stats.sprint / (avg.sprint || 1)
    };
    
    switch (h.strategy) {
      case 'FRONT_RUNNER':
        h.strategyParams = {
          earlyPace: isLong ? 0.96 : (isShort ? 0.98 : 0.94),
          midPace: isLong ? 0.90 : (isShort ? 0.93 : 0.89),
          latePace: isLong ? 0.86 : (isShort ? 0.90 : 0.83),
          energyDrain: isLong ? 1.12 : 0.98,
          kickPhase: isLong ? 0.72 : 0.88
        };
        break;
      case 'PRESSER':
        h.strategyParams = {
          earlyPace: isLong ? 0.86 : (isShort ? 0.90 : 0.92),
          midPace: isLong ? 0.91 : (isShort ? 0.91 : 0.95),
          latePace: isLong ? 1.00 : 1.02,
          energyDrain: 1.06,
          kickPhase: 0.72,
          kickMult: 1.06,
          surgeWindow: 0.16,
          gapTrigger: 0.85
        };
        break;
      case 'STALKER':
        h.strategyParams = {
          earlyPace: isLong ? 0.80 : 0.80,
          midPace: isLong ? 0.92 : 0.89,
          latePace: isLong ? 1.10 : 1.07,
          energyDrain: 0.92,
          kickPhase: 0.72
        };
        break;
      case 'CLOSER':
        h.strategyParams = {
          earlyPace: isShort ? 0.78 : 0.68,
          midPace: 1.00,
          latePace: isLong ? 1.28 : 1.20,
          energyDrain: 0.70,
          kickPhase: isShort ? 0.75 : 0.80
        };
        break;
    }
  });
  
  const dist = {};
  horses.forEach(h => dist[h.strategy] = (dist[h.strategy]||0)+1);
  console.log('📊 Final strategy distribution:', dist);
  horses.forEach(h => console.log(`🐴 ${h.name.padEnd(20)} → ${h.strategy}`));
  
  if (typeof showStrategySummary === 'function') {
    showStrategySummary(horses);
  }
  
  return horses;
}

window.assignRacingStrategies_pack = assignRacingStrategies_pack;
console.log('✅ strategies.js (compact-field tuning) loaded');

// ======== Sedat Commentary Flags ========
window.sedatLeadPlayed = false;
window.sedatFinalPlayed = false;
window.sedatPushPlayed = false;
window.sedatFinishPlayed = false;
window.sedatWinnerPlayed = false;


function updateHorses_pack(dt) { 
  if (!raceActive) return;
  
  const BASE_LOCK_OFFSET = 14;
  const MIN_RACE_SPEED = 0.6;
  const SPACING_FACTOR = 0.8;
  const VAR_FALLBACK = 0.06;
  const JITTER_CLAMP = 0.03;
  const LEADER_DRAG_CAP = 0.10;
  const DRAFT_MIN_L = 1.2;
  const DRAFT_MAX_L = 3.5;
  const DRAFT_CAP = 0.02;
  const ELASTIC_MIN_GAPL = 6;
  const ELASTIC_CAP = 0.07;
  
  const leaderXGlobal = Math.max(...horses.map(h => h.x));
  
  horses.forEach(h => {
    const MOVING_EPS = 0.08;
    if (!h.finished) {
      if (h.speed > MOVING_EPS) h.step += h.speed * 0.08;
    } else {
      if (h.stopped) {
        h.speed = 0;
        if (!h._animFrozen) {
          h._animFrozen = true;
          h.step = Math.floor(h.step);
        }
      } else {
        if (h.speed > MOVING_EPS) h.step += h.speed * 0.08;
      }
    }
    
    if (h.finished) {
      if (!h._stop) {
        const v0 = Math.max(0.1, h.speed);
        const staminaFactor = 0.6 + 0.8 * (h.stats.stamina ?? 1);
        const rnd = 8 + Math.random() * 18;
        const coastPx = (30 + v0 * 25) * staminaFactor + rnd;
        const stopTime = Math.max(1.1, Math.min(2.5, 0.9 + 0.8 * v0));
        h._stop = {
          t: 0,
          v0,
          stopTime,
          lockX: finishLine + BASE_LOCK_OFFSET + coastPx
        };
      }
      h._stop.t += dt;
      const u = Math.min(1, h._stop.t / h._stop.stopTime);
      const v = h._stop.v0 * (1 - u * u * u);
      let vAdj = v;
      const oneLengthPx_pf = Math.max(1, (h.stats.baseSpeed || 1) * 12);
      const spacingPx = oneLengthPx_pf * SPACING_FACTOR;
      let nearestAhead = Infinity;
      for (const o of horses) {
        if (o === h || !o.finished) continue;
        if (o.x > h.x) nearestAhead = Math.min(nearestAhead, o.x - h.x);
      }
      if (nearestAhead < spacingPx) {
        const tight = Math.max(0, nearestAhead / spacingPx);
        vAdj *= 0.35 + 0.65 * tight;
      }
      h.speed = vAdj;
      h.x += h.speed * dt * 60;
      if (h.x >= h._stop.lockX || h.speed < 0.05 || u >= 1) {
        h.speed = 0;
        h.x = Math.min(h.x, h._stop.lockX);
        h.stopped = true;
      }
      return;
    }
    
    const prog = Math.min(1, (h.x - 50) / (finishLine - 50));
	
	// ---- Sedat Final Stretch ----
if (!window.sedatFinalPlayed && prog > 0.90) {
    window.soundManager.play("sedat_final");
    window.sedatFinalPlayed = true;
}

	
	
    const totalF = FURLONGS_TOTAL;
    const curF = Math.max(0, Math.min(totalF, (h.x - START_X) / PPF));
    const sp = h.strategyParams || {};
    const earlyPace = sp.earlyPace ?? 0.9;
    const midPace = sp.midPace ?? 0.9;
    const latePace = sp.latePace ?? 0.95;
    const kickPhase = sp.kickPhase ?? 0.80;
    const paceTarget = 
      prog < 0.33 ? earlyPace :
      prog < Math.min(0.70, kickPhase) ? midPace :
      prog >= kickPhase ? latePace : midPace;
    const baseSpeed = (h.stats.baseSpeed || 1) * paceTarget;
    const longness = Math.min(1, Math.max(0, (totalF - 12) / 12));
    const staminaPower = 1.5 + 0.4 * longness;
    const staminaEffect = Math.pow((h.stats.stamina || 1), staminaPower * prog);
    const isLeading = h.x >= leaderXGlobal - 5;
    const energyDrain = sp.energyDrain ?? 1.1;
// Add spur fatigue penalty
const spurPenalty = h._spurFatiguePenalty || 0;
const tired = 1 - ((h.stats.fatigue || 0) + spurPenalty) * Math.max(0, prog - 0.65) * (isLeading ? energyDrain * 0.6 : 0.8);
    const rawJitter = (Math.random() - 0.5) * (h.stats.variance ?? VAR_FALLBACK)* Math.sqrt(dt * 60);
    const jitter = Math.max(-JITTER_CLAMP, Math.min(JITTER_CLAMP, rawJitter));
    let s = baseSpeed * staminaEffect * tired + jitter;
    
	
	// ⭐ DEBUG: Track Darkmane Voyager speed
if (h.name === "Darkmane Voyager") {
    console.log("DV speed before other effects:", s.toFixed(4));
}

	
    const xs = horses.map(o => o.x).sort((a,b)=>b-a);
	
	// ---- Sedat Lead ----
const sorted = [...horses].sort((a,b)=>b.x-a.x);
const newLeader = sorted[0];

if (!window.sedatLeadPlayed && lastLeader !== newLeader.name) {
    window.soundManager.play("sedat_lead");
    window.sedatLeadPlayed = true;
}
lastLeader = newLeader.name;

	
	
    const leaderX = xs[0] || 0;
    const secondX = xs[1] || leaderX;
    const oneLengthPx = 40;
    const leadGapLengths = (leaderX - secondX) / oneLengthPx;
    
   // NEW: Leader drag only if the leader is 1+ horse lengths ahead
if (leadGapLengths >= 1) {
  const baseLeaderTax = 1 + 0.04 * prog + 0.06 * longness;
  const clearLeadTax = leadGapLengths > 3 ? 0.02 * Math.min(3, (leadGapLengths - 3)) : 0;
  const leaderDrag = 1 - Math.min(LEADER_DRAG_CAP, (baseLeaderTax - 1) + clearLeadTax);
  s *= leaderDrag;
} else {
      let nearestAheadPx = Infinity;
      for (const o of horses) {
        if (o === h) continue;
        if (o.x > h.x) nearestAheadPx = Math.min(nearestAheadPx, o.x - h.x);
      }
      const nearestAheadL = nearestAheadPx / oneLengthPx;
      if (nearestAheadL >= DRAFT_MIN_L && nearestAheadL <= DRAFT_MAX_L) {
        const draftBase = 0.015 + 0.02 * longness;
        const stratBonus = h.strategy === 'STALKER' ? 0.01 : 0.0;
        const draftGain = Math.min(DRAFT_CAP, draftBase + stratBonus);
        s *= (1 + draftGain);
      }
      const gapBehindLeaderL = (leaderX - h.x) / oneLengthPx;
	  
	  // ---- Sedat Push (horse accelerating fast) ----
if (!window.sedatPushPlayed && s > baseSpeed * 1.20) {
    window.soundManager.play("sedat_push");
    window.sedatPushPlayed = true;
}

	  
	  
      if (gapBehindLeaderL > ELASTIC_MIN_GAPL) {
        const lateFactor = Math.max(0, (prog - 0.45) / 0.55);
        const assist = Math.min(ELASTIC_CAP, 0.025 + 0.03 * longness + 0.03 * lateFactor);
        s *= (1 + assist);
      }
    }
    
    if (h._kickCooldown == null) h._kickCooldown = 0;
    if (h._kickTimer == null) h._kickTimer = 0;
    h._kickCooldown -= dt;
    h._kickTimer = Math.max(0, h._kickTimer - dt);
    if (h._kickCooldown <= 0 && Math.random() < 0.008 * (h.stats.kick || 0) * dt * 60) {
      h._kickTimer = 0.5 + 0.6 * (h.stats.kick || 0);
      h._kickCooldown = 4.0 + Math.random() * 3.0;
    }
    if (prog > 0.88 && h._kickTimer === 0 && !h._lateKickUsed) {
      h._kickTimer = 0.7 + 0.9 * (h.stats.kick || 0);
      h._lateKickUsed = true;
    }
    const kickBoost = h._kickTimer > 0
      ? 1 + (0.15 + 0.35 * (h.stats.kick || 0)) * (1 - prog * 0.3)
      : 1;
    s *= kickBoost;
    
    if (h.strategy === 'STALKER') {
      const behindPx = leaderXGlobal - h.x;
      const gapL = behindPx / oneLengthPx;
      if (prog > 0.30 && prog < 0.75 && gapL > 1.4) {
        const gain = Math.min(0.05, 0.012 + 0.02 * (gapL - 1.4));
        s *= (1 + gain);
      }
      if (prog > 0.82) s *= 1.03;
      if ((totalF - curF) <= 5 && gapL > 0.4 && gapL < 2.2) {
        s *= 1.012;
      }
    }
    
    if (h.strategy === 'PRESSER') {
      const surgeWindow = sp.surgeWindow ?? 0.18;
      const gapTrigger = sp.gapTrigger ?? 0.8;
      const kickMult = sp.kickMult ?? 1.06;
      if (prog >= (sp.kickPhase ?? 0.72)) {
        s *= kickMult;
        if (prog >= (1 - surgeWindow)) {
          const gapL = (leaderXGlobal - h.x) / oneLengthPx;
          if (gapL > gapTrigger) {
            const catchUp = Math.min(1.08, 1 + 0.04 * Math.tanh(gapL - gapTrigger));
            s *= catchUp;
          }
        }
      }
    }
    
    if (h.strategy === 'CLOSER') {
      const gapL = (leaderXGlobal - h.x) / oneLengthPx;
      if (curF >= 7 && totalF > 7) {
        const longPhase = Math.min(1, (curF - 7) / Math.max(1, (totalF - 7)));
        const maxLongBoost = (0.25 + 0.15 * longness) * (0.80 + 0.25 * (h.stats.finalBoost || 1));
        const longMult = 1 + longPhase * maxLongBoost;
        if (gapL <= 0.5) {
          s *= 0.90;
        } else if (gapL > 0.5 && gapL < 2.5) {
          const closerFactor = (gapL - 0.5) / 2.0;
          s *= 1 + (longMult - 1) * closerFactor;
        } else {
          s *= Math.min(longMult, 1.35);
        }
      }
    }
    
    if (h._finalBoostUsed && prog > 0.9) {
      s *= 1.0 - (prog - 0.9) * 0.15;
    }
    
    h.speed = Math.max(MIN_RACE_SPEED, s);
    h.x += h.speed * dt * 60;
    h.step += h.speed * 0.08;
    
  
	
	if (h.x >= finishLine && !h.finished) {
    
    h.finished = true;
    h.finishTime = performance.now();
    
    // Get position BEFORE pushing to array
    const currentPosition = finishOrder.length + 1;
    
    finishOrder.push({
        name: h.name,
        lane: h.lane,
        color: h.color,
        position: currentPosition,
        strategy: h.strategy,
        handicap: h.handicap,
        finishTime: h.finishTime
    });
    
    // Only announce first 4 positions
    if (currentPosition <= 4) {
        // Prepare horse name file
        const horseFile = h.name.replace(/ /g, "_");
        
        // Calculate delay so each announcement waits for previous to finish
const baseDelay = currentPosition === 2 ? 2000 : currentPosition === 3 ? 2500 : currentPosition === 4 ? 3000 : 0;        
        // ---- 1st PLACE: Winner announcement ----
        if (currentPosition === 1) {
            if (!window.sedatWinnerPlayed) {
                // Play horse name
                window.soundManager.play(`sedat_name_${horseFile}`);
                window.sedatWinnerPlayed = true;
                
                // After 1.8s → "wins"
                setTimeout(() => {
                    window.soundManager.play("sedat_wins");
                }, 1800);
                
               }
        }
        // ---- 2nd, 3rd, 4th: Position announcement ----
        else {
            const positionWords = {
                2: "second",
                3: "third",
                4: "fourth"
            };
            
            const positionWord = positionWords[currentPosition];
            
            if (positionWord) {
                // Wait for previous announcements to finish
                setTimeout(() => {
                    // Play horse name
                    window.soundManager.play(`sedat_name_${horseFile}`);
                    
                    // After 1.8s → position (second, third, fourth)
                    setTimeout(() => {
                        window.soundManager.play(`sedat_position_${positionWord}`);
                    }, 1200);
                }, baseDelay);
            }
        }
    }
    
    // Check if race is complete
    if (finishOrder.length === horses.length) {
        raceFinished = true;
        raceActive = false;
        
        // Stop racing sounds, play finish
        if (window.soundManager) {
            window.soundManager.stop('gallop');
            window.soundManager.stop('crowd');
            window.soundManager.play('finish');
        }
        
        saveRaceResultsToWindow();  // Save results FIRST
        showResults();
    }
}
	
	
  });
  
  
  // ---------------------------------------------
// 🚀 DELETEstart
// ---------------------------------------------
// ---------------------------------------------
// 🚀 Sedat Lead Commentary (AFTER horses updated)
// ---------------------------------------------
if (!window.sedatLeadPlayed) {

    if (!window.raceStartTime) window.raceStartTime = performance.now();

    const timeSinceStart = performance.now() - window.raceStartTime;

    // 1. Atlar en az 3 saniye koşmuş olacak
    if (timeSinceStart > 3000) {

        // 2. Yarış ilerlemesi en az %5 olmalı
        if (avgProg > 0.05) {

            const sortedHorses = [...horses].sort((a,b)=>b.x-a.x);
            const newLeader = sortedHorses[0].name;

            if (lastLeader !== newLeader) {
                console.log("🎤 Sedat Lead Triggered:", newLeader);
                window.soundManager.play("sedat_lead");
                window.sedatLeadPlayed = true;
            }

            lastLeader = newLeader;
        }
    }
}

// 🚀 DELETElast



  
// Compute progress ONCE
let avgProg = 0;

if (raceActive && !raceFinished) {
    avgProg = horses.reduce(
        (sum, h) => sum + Math.min(1, (h.x - 50) / (finishLine - 50)), 
        0
    ) / horses.length;
}

// --- Sedat or AI commentary ---
if (window.sedatMode === true) {
    window.triggerSedatCommentary(horses, avgProg);
}  



  
  refreshLeaderboard();
  updateRaceResults();
}
// Live race commentary system
let lastLeader = null;







// ADD THIS NEW FUNCTION at the bottom of the same <script> tag
function saveRaceResultsToWindow() {
  console.log('🟢 saveRaceResultsToWindow() CALLED');
  console.log('finishOrder:', finishOrder);
  
  const raceResults = [{
    raceNum: 1,
    results: finishOrder.map((h, i) => ({
      position: i + 1,
      name: h.name,
      lane: h.lane,
      color: h.color,
      handicap: h.handicap
    }))
  }];
  
  window.raceHistory = raceResults;
  console.log('✅ window.raceHistory SET:', window.raceHistory);
}




window.updateHorses_pack = updateHorses_pack;
console.log("✅ updateHorses_pack (tight pack) loaded successfully");
