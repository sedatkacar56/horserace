// ===========================
// WHIP HUD UI
// ===========================

/**
 * Update whip HUD display
 */
export function updateWhipHUD(playerSystem) {
  const whipHUD = document.getElementById('whipHUD');
  if (!whipHUD) return;
  
if (playerSystem.enabled && window.raceActive) {
	/*if(window.whipUsed){
    whipHUD.style.display = 'flex';
	} else {
		    whipHUD.style.display = 'none';
	}*/
	
	if (window.whipUsed || window.spurUsed) {
    whipHUD.style.display = 'flex';
} else {
    whipHUD.style.display = 'none';
}


    
    // Update P1
    const p1WhipCount = document.getElementById('p1WhipCount');
	const p1SpurCount = document.getElementById('p1SpurCount');  // ← ADD THIS
    const p1Cooldown = document.getElementById('p1Cooldown');
	const p1PressureCount = document.getElementById('p1PressureCount');
    const p1HorseName = document.getElementById('p1HorseName');
    
    if (p1WhipCount) {
      p1WhipCount.textContent = `Whips: ${playerSystem.p1.whipsLeft}`;
    }
    
	if (p1SpurCount) {
  p1SpurCount.textContent = `⚡ Spurs: ${playerSystem.p1.spursLeft}`;
  p1SpurCount.style.opacity = playerSystem.p1.spursLeft > 0 ? '1' : '0.3';
}

    if (p1Cooldown) {
      p1Cooldown.textContent = playerSystem.p1.cooldown > 0 
        ? `Cooldown: ${playerSystem.p1.cooldown.toFixed(1)}s` 
        : '';
    }
	
	if (p1PressureCount) {
  p1PressureCount.textContent = `🟦 Pressure: ${playerSystem.p1.pressuresLeft}`;
  p1PressureCount.style.opacity = playerSystem.p1.pressuresLeft > 0 ? '1' : '0.3';
}
    
    if (p1HorseName && playerSystem.p1.horse) {
      p1HorseName.textContent = playerSystem.p1.horse.name;
    }
    
    // Update P2
    const p2WhipCount = document.getElementById('p2WhipCount');
		const p2SpurCount = document.getElementById('p2SpurCount');  // ← ADD THIS
    const p2Cooldown = document.getElementById('p2Cooldown');
    const p2HorseName = document.getElementById('p2HorseName');
    const p2PressureCount = document.getElementById('p2PressureCount');

    if (p2WhipCount) {
      p2WhipCount.textContent = `Whips: ${playerSystem.p2.whipsLeft}`;
    }
    
	if (p2SpurCount) {
  p2SpurCount.textContent = `⚡ Spurs: ${playerSystem.p2.spursLeft}`;
  p2SpurCount.style.opacity = playerSystem.p2.spursLeft > 0 ? '1' : '0.3';
}

if (p2PressureCount) {
  p2PressureCount.textContent = `🟦 Pressure: ${playerSystem.p2.pressuresLeft}`;
  p2PressureCount.style.opacity = playerSystem.p2.pressuresLeft > 0 ? '1' : '0.3';
}

    if (p2Cooldown) {
      p2Cooldown.textContent = playerSystem.p2.cooldown > 0 
        ? `Cooldown: ${playerSystem.p2.cooldown.toFixed(1)}s` 
        : '';
    }
    
    if (p2HorseName && playerSystem.p2.horse) {
      p2HorseName.textContent = playerSystem.p2.horse.name;
    }
	
	
	    // Update P3
    const p3WhipCount = document.getElementById('p3WhipCount');
		const p3SpurCount = document.getElementById('p3SpurCount');  // ← ADD THIS
    const p3Cooldown = document.getElementById('p3Cooldown');
    const p3HorseName = document.getElementById('p3HorseName');
    const p3PressureCount = document.getElementById('p3PressureCount');

    if (p3WhipCount) {
      p3WhipCount.textContent = `Whips: ${playerSystem.p3.whipsLeft}`;
    }
    if (p3SpurCount) {
  p3SpurCount.textContent = `⚡ Spurs: ${playerSystem.p3.spursLeft}`;
  p3SpurCount.style.opacity = playerSystem.p3.spursLeft > 0 ? '1' : '0.3';
}
    if (p3Cooldown) {
      p3Cooldown.textContent = playerSystem.p3.cooldown > 0 
        ? `Cooldown: ${playerSystem.p3.cooldown.toFixed(1)}s` 
        : '';
    }
	
    if (p3PressureCount) {
  p3PressureCount.textContent = `🟦 Pressure: ${playerSystem.p3.pressuresLeft}`;
  p3PressureCount.style.opacity = playerSystem.p3.pressuresLeft > 0 ? '1' : '0.3';
}
    if (p3HorseName && playerSystem.p3.horse) {
      p3HorseName.textContent = playerSystem.p3.horse.name;
    }
	
	
  } else {
    whipHUD.style.display = 'none';
  }
}