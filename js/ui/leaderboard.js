// ===========================
// LEADERBOARD UI
// ===========================

/**
 * Refresh the current standings leaderboard
 */
export function refreshLeaderboard(
  horses = window.horses,
  params = window.gameState?.params,
  raceHistory = window.raceHistory || []
) {
  if (!Array.isArray(horses)) return;

  const leaderboard = document.getElementById('leaderboard');
  if (!leaderboard) return;

  const fl = params?.finishLine ?? window.gameState?.params?.finishLine ?? 1;

  const sorted = [...horses].sort((a, b) => b.x - a.x);
  let html = '<h4 style="margin:8px 0">🏇 Current Standings</h4>';

  sorted.forEach((h, i) => {
    const pct = Math.max(0, Math.round((h.x / fl) * 100));

    let raceCode = '';
    if (raceHistory.length && raceHistory[0]?.results) {
      const result = raceHistory[0].results.find(r => r.name === h.name);
      if (result) raceCode = (result.position >= 10 ? '0' : '') + result.position;
    }

    const strategyBadge = h.strategy
      ? `<span style="background:${getStrategyColor(h.strategy)};color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-left:5px">${h.strategy}</span>`
      : '';

    html += `<div class="horse-info">
      ${i+1}. <b>${h.name}</b> ${strategyBadge} — Lane ${h.lane} — <span style="color:${h.color}">●</span> ${pct}%
    </div>`;
  });

  leaderboard.innerHTML = html;
}


/**
 * Get color for racing strategy
 */
export function getStrategyColor(strategy) {
  switch(strategy) {
    case 'FRONT_RUNNER': return '#ff4444';
    case 'PRESSER': return '#ff9800';
    case 'STALKER': return '#2196F3';
    case 'CLOSER': return '#9c27b0';
    default: return '#666';
  }
}

/**
 * Show strategy summary panel
 */
export function showStrategySummary(horses) {
  const counts = { FRONT_RUNNER: 0, PRESSER: 0, STALKER: 0, CLOSER: 0 };
  horses.forEach(h => {
    if (h.strategy) counts[h.strategy] = (counts[h.strategy] || 0) + 1;
  });
  
  const summaryHTML = `
    <div id="strategySummary" style="
      background:rgba(0,0,0,0.2);
      padding:10px;
      margin:8px 0;
      border-radius:6px;
      font-size:13px;">
      <div style="font-weight:bold;margin-bottom:4px;">🏇 Strategy Mix</div>
      ${Object.entries(counts).map(([name, count]) =>
        `<div style="margin:2px 0;">
          <span style="display:inline-block;width:12px;height:12px;background:${getStrategyColor(name)};border-radius:3px;margin-right:6px;"></span>
          ${name.replace('_',' ')}: <b>${count}</b>
        </div>`).join('')}
    </div>
  `;
  
  const leaderboard = document.getElementById('leaderboard');
  if (leaderboard) {
    // Remove previous summary if it exists
    const existing = document.getElementById('strategySummary');
    if (existing) existing.remove();
    
    // Insert before leaderboard section
    leaderboard.insertAdjacentHTML('beforebegin', summaryHTML);
  }
}

/**
 * Update complete horse statistics table
 */
export function updateCompleteStats() {
  const panelEl = document.querySelector('#statsPanel #completeStats');
  const inlineEl = document.getElementById('completeStatsInline');
  const targetEl = (panelEl && !panelEl.classList.contains('hidden')) ? panelEl : inlineEl;
  if (!targetEl) return;
  
  const horses = Array.isArray(window.HORSE_DATA) ? window.HORSE_DATA : [];
  if (!horses.length) {
    targetEl.innerHTML = '<div class="tiny" style="opacity:.7">No horses found</div>';
    return;
  }
  
  // Helper: keep last 10 digits if position is long numeric/string
  const last10 = v => {
    if (v == null) return '-';
    const s = String(v).replace(/[^\d]/g, '');
    if (!s) return String(v);
    return s.length > 10 ? s.slice(-10) : s;
  };
  
  const cell = (txt, align = 'left') =>
    `<td style="padding:6px;text-align:${align};white-space:nowrap;">${txt}</td>`;
  
  let html = `
    <div style="padding:8px;border-radius:6px;overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:rgba(0,0,0,.25);font-weight:700;">
            <th style="text-align:left;padding:6px;">Horse</th>
            <th style="text-align:right;padding:6px;">Position</th>
            <th style="text-align:right;padding:6px;">HCP</th>
            <th style="text-align:right;padding:6px;">NO</th>
            <th style="text-align:right;padding:6px;">HAVG</th>
            <th style="text-align:right;padding:6px;">W</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  horses.forEach((h, i) => {
    const dot = `<span style="color:${h.color};font-size:14px">●</span>`;
    const pos = last10(h.position);
    const hcp = h.handicap ?? h.HANDICAP ?? h.weight ?? '-';
    const no = h.hndp_race ?? '-';
    const havg = h.aver_hndp ?? '-';
    const wins = h.wins ?? '-';
    
    html += `
      <tr style="border-bottom:1px solid rgba(255,255,255,.1);${i % 2 ? 'background:rgba(0,0,0,.06);' : ''}">
        ${cell(`${dot} <b>${h.name}</b>`, 'left')}
        ${cell(pos, 'right')}
        ${cell(hcp, 'right')}
        ${cell(no, 'right')}
        ${cell(havg, 'right')}
        ${cell(wins, 'right')}
      </tr>
    `;
  });
  
  html += `</tbody></table></div>`;
  targetEl.innerHTML = html;
}

// ✅ Add this AFTER all the functions (outside of them)
window.refreshLeaderboard = refreshLeaderboard;
window.showStrategySummary = showStrategySummary;
window.updateCompleteStats = updateCompleteStats;