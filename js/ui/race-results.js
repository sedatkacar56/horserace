// ===========================
// RACE RESULTS UI (FIXED - User Override Works Correctly)
// ===========================

import { updateCompleteStats, refreshLeaderboard } from './leaderboard.js';

// User control flags
export let resultsUserHidden = false;            // User clicked "Hide"
export let resultsUserRequestedVisible = false;  // User clicked "Show"
export let resultsUserForcedOverride = false;    // User overrides race logic


// ===========================
// INIT TOGGLE BUTTON
// ===========================
export function initResultsPanel() {
  const toggleResultsBtn = document.getElementById('toggleResultsBtn');
  const raceResults = document.getElementById('raceResults');

  if (!toggleResultsBtn || !raceResults) return;

  toggleResultsBtn.onclick = () => {

    const isHidden = raceResults.style.display === 'none';

    // User override ON now
    resultsUserForcedOverride = true;

    // Update flags
    resultsUserHidden = !isHidden;          // user clicked to hide
    resultsUserRequestedVisible = isHidden; // user clicked to show

    // Apply visibility immediately
    raceResults.style.display = isHidden ? 'block' : 'none';

    // Update button text
    toggleResultsBtn.textContent = isHidden
      ? 'Hide Results Panel'
      : 'Show Results Panel';

    // Update display content
    updateRaceResults(
      window.gameState?.horses || [],
      window.finishOrder || [],
      window.raceActive,
      window.raceFinished
    );
  };
}



// ===========================
// UPDATE RESULTS PANEL (FIXED)
// ===========================
export function updateRaceResults(horses, finishOrder, raceActive, raceFinished) {
  const raceResults = document.getElementById('raceResults');
  if (!raceResults) return;

  // ⭐ USER OVERRIDE ALWAYS WINS - Handle separately ⭐
  if (resultsUserForcedOverride) {
    // Apply user's choice
    raceResults.style.display = resultsUserHidden ? 'none' : 'block';
    
    // If hidden, stop here - don't update content
    if (resultsUserHidden) {
      return;
    }
    
    // If showing, continue to build HTML below
    // (skip all auto-show/hide logic)
  } else {
    // ===========================
    // AUTO-SHOW/HIDE LOGIC (only when user hasn't overridden)
    // ===========================
    
    // Hide before race starts
    if (!raceActive && (!finishOrder || finishOrder.length === 0)) {
      raceResults.style.display = 'none';
      return;
    }

    // Auto-show if results exist
    if (finishOrder && finishOrder.length > 0) {
      raceResults.style.display = 'block';
    } else {
      raceResults.style.display = 'none';
      return;
    }
  }

  // ===========================
  // BUILD RESULTS HTML
  // ===========================
  let html = '<h3 style="margin:0 0 10px 0; font-size:18px;">📊 Race Results</h3>';

  // Finished horses
  if (finishOrder && finishOrder.length > 0) {
    finishOrder.forEach((h, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      html += `<div class="result-item">
        <span class="result-position">${i+1}${getOrdinalSuffix(i+1)}</span>
        ${medal ? `<span class="result-medal">${medal}</span>` : ''}
        <span style="color:${h.color};font-size:20px">●</span>
        <span style="flex:1"><b>${h.name}</b><br/><small>Lane ${h.lane}</small></span>
      </div>`;
    });
  }

  // Still-racing section
  if (horses && !raceFinished) {
    const stillRacing = horses.filter(h => !h.finished);
    if (stillRacing.length > 0) {
      const params = window.gameState?.params;
      html += '<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.3)">';
      html += '<div style="font-size:13px;opacity:0.8;margin-bottom:6px">Still Racing:</div>';

      stillRacing.forEach(h => {
        const pct = params ? Math.max(0, Math.min(100, Math.round((h.x / params.finishLine) * 100))) : 0;
        html += `<div style="padding:4px;margin:3px 0;font-size:13px">
          <span style="color:${h.color}">●</span> ${h.name} - ${pct}%
        </div>`;
      });

      html += '</div>';
    }
  }

  raceResults.innerHTML = html;
}



// ===========================
// WINNER MODAL + HISTORY BELOW
// (unchanged)
// ===========================

export function showWinnerModal(finishOrder, raceHistory) {
  const el = document.getElementById('winner');
  if (!el) return;

  let html = `<div style="font-size:28px; margin-bottom:16px;">🏆 RACE COMPLETE 🏆</div>`;
  html += '<div style="text-align:left;">';

  finishOrder.forEach((h, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
	
	  // Calculate margin from PREVIOUS horse (not winner)
  let marginText = '';
  if (i > 0) {
    const previousTime = finishOrder[i - 1].finishTime; // Horse directly ahead
    const timeDiff = (h.finishTime - previousTime) / 1000; // Convert to seconds
    marginText = ` <span style="opacity:0.7">(+${getMarginDescription(timeDiff)})</span>`;
  }
  	const fontSize = 15;
    html += `<div style="margin:5px 0; font-size:${fontSize}px; padding:8px; background:rgba(139,69,19,0.3); border-radius:6px;">
      ${medal} <b>${i+1}${getOrdinalSuffix(i+1)}</b> - 
      <span style="color:${h.color}">●</span> ${h.name} 
      <small style="opacity:0.8">${formatFinishTime(h.finishTime)}</small>${marginText}
    </div>`;
  });

  html += '</div>';

  // Download area
  html += `
    <div style="margin-top:20px; padding-top:16px; border-top:2px solid rgba(139,69,19,0.5);">
      <button id="downloadResultsBtn" style="
        width:100%; 
        background:#FF9800; 
        color:#fff; 
        border:none; 
        border-radius:8px; 
        padding:14px; 
        font-size:16px; 
        font-weight:bold; 
        cursor:pointer;
        transition:0.2s;
        box-shadow:0 4px 8px rgba(0,0,0,0.3);">
        📥 Download racehistory.js
      </button>

      <div style="margin-top:12px; text-align:center;">
        <label style="font-size:13px; cursor:pointer; opacity:0.9;">
          <input type="checkbox" id="autoDownloadCheckbox" style="margin-right:6px;">
          Auto-download after each race
        </label>
      </div>
    </div>
  `;

  el.innerHTML = html;
  el.style.display = 'block';

  // Setup download handlers
  setTimeout(() => {
    setupDownloadHandlers(raceHistory);
  }, 0);
}


// Download, History, Ordinal (unchanged below)…
function setupDownloadHandlers(raceHistory) {
  const downloadBtn = document.getElementById('downloadResultsBtn');
  const autoCheckbox = document.getElementById('autoDownloadCheckbox');

  if (downloadBtn) {
    downloadBtn.onclick = () => downloadRaceHistory(raceHistory);
    downloadBtn.onmouseover = () => downloadBtn.style.background = '#F57C00';
    downloadBtn.onmouseout = () => downloadBtn.style.background = '#FF9800';
  }

  if (autoCheckbox) {
    const savedPref = localStorage.getItem('autoDownloadRaceHistory');
    const autoDownload = savedPref === null ? true : savedPref === 'true';
    autoCheckbox.checked = autoDownload;
    autoCheckbox.onchange = () =>
      localStorage.setItem('autoDownloadRaceHistory', autoCheckbox.checked);

    if (autoDownload) {
      setTimeout(() => downloadRaceHistory(raceHistory), 500);
    }
  }
}


export function downloadRaceHistory(raceHistory) {


  console.log('🔍 downloadRaceHistory called');// xxxxx
  console.log('raceHistory parameter:', raceHistory);// xxxxx
  console.log('window.raceHistory:', window.raceHistory);// xxxxx
  console.log('raceHistory[0]:', raceHistory ? raceHistory[0] : 'undefined');// xxxxx
  console.log('raceHistory[0]?.results:', raceHistory ? raceHistory[0]?.results : 'undefined');// xxxxx


  const latest = (raceHistory && raceHistory[0]?.results) || [];
    console.log('📥 latest to download:', latest);// xxxxx

  const jsContent = `// Last Race Data Only
   window.RACE_HISTORY_DATA = {
  results: ${JSON.stringify(latest, null, 2)}
};
`;

  const blob = new Blob([jsContent], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'racehistory.js';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showDownloadNotification();
}


function showDownloadNotification() {
  const notification = document.createElement('div');
  notification.textContent = '✅ racehistory.js downloaded!';
  notification.style.cssText = `
    position:fixed; top:50%; left:50%; transform:translate(-50%, -50%);
    background:#4CAF50; color:#fff; padding:16px 24px; border-radius:8px;
    font-weight:bold; z-index:10000; box-shadow:0 4px 12px rgba(0,0,0,0.3);
    animation:fadeInOut 2s ease-in-out;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}


export function updateRaceHistory(raceHistory, horses, params) {
  const el = document.getElementById('raceHistory');
  if (!el) {
    updateCompleteStats();
    return;
  }

  if (raceHistory.length === 0) {
    el.innerHTML = '<div class="tiny" style="opacity:0.7">No races completed yet</div>';
    updateCompleteStats();
    return;
  }

  let html = '';
  raceHistory.slice().reverse().forEach((race, idx) => {
    const actualRaceNum = raceHistory.length - idx;
    html += `<div style="background:rgba(0,0,0,0.2);padding:8px;margin:6px 0;border-radius:6px">
      <div style="font-weight:bold;margin-bottom:4px">Race #${actualRaceNum}</div>
      <div style="font-size:12px">`;

    race.results.forEach(r => {
      const medal =
        r.position === 1 ? '🥇' :
        r.position === 2 ? '🥈' :
        r.position === 3 ? '🥉' : '';
      
      const hcp = r.handicap ? ` HCP:${r.handicap}` : '';
      const no  = r.hndp_race ? ` NO:${r.hndp_race}` : '';
      const havg= r.aver_hndp ? ` HAVG:${r.aver_hndp}` : '';
      const wins= r.wins ? ` W:${r.wins}` : '';

      html += `<div style="padding:2px 0">
        ${medal} ${r.position}. <span style="color:${r.color}">●</span> ${r.name} (L${r.lane})${hcp}${no}${havg}${wins}
      </div>`;
    });

    html += `</div></div>`;
  });

  el.innerHTML = html;
  updateCompleteStats();
}


export function getOrdinalSuffix(num) {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}


function formatFinishTime(finishTime) {
  if (!finishTime || !window.raceStartTime) return '--:--.---';
  
  const totalMs = finishTime - window.raceStartTime;
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis = Math.floor(totalMs % 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}


function getMarginDescription(timeDiff) {
  if (timeDiff < 0.09232) return 'nose'; //0.09232
  if (timeDiff < 0.20772) return 'head'; //0.20772
  if (timeDiff < 0.300) return 'neck';//
  if (timeDiff < 0.480) return 'half length'; //
  if (timeDiff < 0.75) return '1 length';//0.60 exact 1 horse length insaAllah
  if (timeDiff < 1.05) return '1.5 lengths';//0.90
  if (timeDiff < 1.35) return '2 lengths';//1.2
  if (timeDiff < 1.65) return '2.5 lengths';//1.5
  if (timeDiff < 1.95) return '3 lengths';//1.8
// For 3.5+ lengths, show whole numbers for small gaps, decimals for big gaps
if (timeDiff < 3.45) return `${Math.round(timeDiff / 0.300) / 2} lengths`;  // calculate length terms of half length of 0.300)
  return 'a distance'; //aFTER 5.5 LENGTH call a distance
}
