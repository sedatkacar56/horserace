// ===========================
// RACE RESULTS UI
// ===========================

import { updateCompleteStats, refreshLeaderboard } from './leaderboard.js';

export let resultsUserHidden = false;            // User clicked "Hide"
export let resultsUserRequestedVisible = false;  // User clicked "Show"


/**
 * Initialize results panel toggle
 */
export function initResultsPanel() {
  const toggleResultsBtn = document.getElementById('toggleResultsBtn');
  const raceResults = document.getElementById('raceResults');

  if (toggleResultsBtn && raceResults) {
    toggleResultsBtn.onclick = () => {

      const isHidden = raceResults.style.display === 'none';

      // Update flags
      resultsUserHidden = !isHidden;              // User wants to hide when visible
      resultsUserRequestedVisible = isHidden;     // User wants to show when hidden

      // Apply visibility
      raceResults.style.display = isHidden ? 'block' : 'none';

      // Update button text
      toggleResultsBtn.textContent = isHidden
        ? 'Hide Results Panel'
        : 'Show Results Panel';
      
          updateRaceResults(
        window.gameState?.horses || [],
        window.finishOrder || [],
        window.raceActive,
        window.raceFinished
          );
           
    };
  }

}


/**
 * Update race results panel
 */
export function updateRaceResults(horses, finishOrder, raceActive, raceFinished) {
  const raceResults = document.getElementById('raceResults');
  if (!raceResults) return;
  
    // USER override: wants results visible
  if (resultsUserRequestedVisible) {
    raceResults.style.display = 'block';
  }

  // User wants it hidden
  if (resultsUserHidden) {
    raceResults.style.display = 'none';
    return;
  }
  
  // Hide if race hasn't started
  if (!raceActive && (!finishOrder || finishOrder.length === 0)) {
    raceResults.style.display = 'none';
    return;
  }
  
// Only show results if there ARE results or race has finished
if (finishOrder && finishOrder.length > 0) {
    raceResults.style.display = 'block';
} else {
    raceResults.style.display = 'none';
    return;
}
  let html = '<h3 style="margin:0 0 10px 0; font-size:18px;">📊 Race Results</h3>';
  
  // Show finished horses
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
  
  // Show still racing horses
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

/**
 * Show winner modal with complete results
 */
export function showWinnerModal(finishOrder, raceHistory) {
  const el = document.getElementById('winner');
  if (!el) return;
  
  let html = `<div style="font-size:28px; margin-bottom:16px;">🏆 RACE COMPLETE 🏆</div>`;
  html += '<div style="text-align:left;">';
  
  finishOrder.forEach((h, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
    html += `<div style="margin:10px 0; font-size:${22-i*1.5}px; padding:8px; background:rgba(139,69,19,0.3); border-radius:6px;">
      ${medal} <b>${i+1}${getOrdinalSuffix(i+1)}</b> - <span style="color:${h.color}">●</span> ${h.name} <small style="opacity:0.8">(Lane ${h.lane})</small>
    </div>`;
  });
  
  html += '</div>';
  
  // Add download button and auto-download option
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
          <input type="checkbox" id="autoDownloadCheckbox" style="margin-right:6px; cursor:pointer;">
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

/**
 * Setup download button handlers
 */
function setupDownloadHandlers(raceHistory) {
  const downloadBtn = document.getElementById('downloadResultsBtn');
  const autoCheckbox = document.getElementById('autoDownloadCheckbox');
  
  if (downloadBtn) {
    downloadBtn.onclick = () => downloadRaceHistory(raceHistory);
    downloadBtn.onmouseover = () => downloadBtn.style.background = '#F57C00';
    downloadBtn.onmouseout = () => downloadBtn.style.background = '#FF9800';
  }
  
  if (autoCheckbox) {
    // Load saved preference (default to true)
    const savedPref = localStorage.getItem('autoDownloadRaceHistory');
    const autoDownload = savedPref === null ? true : savedPref === 'true';
    autoCheckbox.checked = autoDownload;
    
    // Save preference on change
    autoCheckbox.onchange = () => {
      localStorage.setItem('autoDownloadRaceHistory', autoCheckbox.checked);
    };
    
    // Auto-download if enabled
    if (autoDownload) {
      setTimeout(() => downloadRaceHistory(raceHistory), 500);
    }
  }
}

/**
 * Download race history as JS file
 */
export function downloadRaceHistory(raceHistory) {
  const latest = (raceHistory && raceHistory[0]?.results) || [];
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
  
  // Show notification
  showDownloadNotification();
}

/**
 * Show download notification
 */
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

/**
 * Update race history display
 */
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
      const medal = r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : '';
      const hcp = r.handicap ? ` HCP:${r.handicap}` : '';
      const no = r.hndp_race ? ` NO:${r.hndp_race}` : '';
      const havg = r.aver_hndp ? ` HAVG:${r.aver_hndp}` : '';
      const wins = r.wins ? ` W:${r.wins}` : '';
      html += `<div style="padding:2px 0">
        ${medal} ${r.position}. <span style="color:${r.color}">●</span> ${r.name} (L${r.lane})${hcp}${no}${havg}${wins}
      </div>`;
    });
    
    html += `</div></div>`;
  });
  
  el.innerHTML = html;
  updateCompleteStats();
}

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(num) {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}