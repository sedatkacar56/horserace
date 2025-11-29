// ===========================
// CONTROLS UI
// ===========================

/**
 * Update button states
 */
export function updateControlButtons(isReady, raceActive) {
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const loadStatus = document.getElementById('loadStatus');
  
  if (startBtn) {
    startBtn.disabled = !isReady;
  }
  
  if (resetBtn) {
    resetBtn.disabled = !raceActive;
  }
  
  if (pauseBtn) {
    pauseBtn.disabled = !raceActive;
  }
  
  if (loadStatus) {
    loadStatus.textContent = isReady 
      ? "Sprites loaded. Ready to race!" 
      : "Loading sprites…";
  }
}

/**
 * Create stats panel
 */
export function createStatsPanel() {
  const statsHTML = `
    <div id="statsPanel" class="hidden"
         style="position:fixed; top:110px; right:20px; z-index:1000;
                width:380px; max-height:70vh; display:flex; flex-direction:column;
                background:rgba(139,69,19,.96); color:#fff; border-radius:12px;
                box-shadow:0 8px 32px rgba(0,0,0,.5); backdrop-filter:blur(2px);">

      <div id="statsHeader"
           style="cursor:grab; user-select:none; padding:10px 12px; display:flex; align-items:center; gap:8px;
                  border-bottom:1px solid rgba(255,255,255,.15); font-weight:700;">
        🏆 All Horses Complete Stats
        <span style="flex:1"></span>
        <button id="closeStats"
                style="background:transparent;border:none;color:#fff;font-size:18px;line-height:1;cursor:pointer">✕</button>
      </div>

      <div id="completeStats" style="padding:10px; overflow:auto; font-size:12px"></div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', statsHTML);
}

/**
 * Setup stats panel drag functionality
 */
export function setupStatsPanelDrag() {
  const statsPanel = document.getElementById('statsPanel');
  const statsHeader = document.getElementById('statsHeader');
  const toggleStats = document.getElementById('toggleStats');
  const closeStats = document.getElementById('closeStats');
  
  if (toggleStats && statsPanel) {
    toggleStats.onclick = () => {
      statsPanel.classList.toggle('hidden');
      if (!statsPanel.classList.contains('hidden')) {
        // Trigger stats update
        const event = new CustomEvent('updateStats');
        window.dispatchEvent(event);
      }
    };
  }
  
  if (closeStats && statsPanel) {
    closeStats.onclick = () => statsPanel.classList.add('hidden');
  }
  
  // Drag logic
  if (statsHeader && statsPanel) {
    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    
    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      statsHeader.style.cursor = 'grabbing';
      
      const rect = statsPanel.getBoundingClientRect();
      statsPanel.style.left = rect.left + 'px';
      statsPanel.style.top = rect.top + 'px';
      statsPanel.style.right = 'auto';
      
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      statsHeader.setPointerCapture(e.pointerId);
    };
    
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      const maxX = window.innerWidth - statsPanel.offsetWidth;
      const maxY = window.innerHeight - statsPanel.offsetHeight;
      const nextLeft = Math.max(0, Math.min(maxX, startLeft + dx));
      const nextTop = Math.max(0, Math.min(maxY, startTop + dy));
      statsPanel.style.left = nextLeft + 'px';
      statsPanel.style.top = nextTop + 'px';
    };
    
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      statsHeader.style.cursor = 'grab';
      statsHeader.releasePointerCapture?.(e.pointerId);
    };
    
    statsHeader.addEventListener('pointerdown', onDown);
    statsHeader.addEventListener('pointermove', onMove);
    statsHeader.addEventListener('pointerup', onUp);
    statsHeader.addEventListener('pointercancel', onUp);
  }
}


// js/ui/controls-ui.js

/**
 * Creates a whip count input with quick select buttons
 */
export function createWhipCountInput() {
  const container = document.createElement('div');
  container.id = 'whipCountInputContainer';
  container.style.cssText = `
    margin: 15px 0;
    padding: 12px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  `;
  
  // Label
  const label = document.createElement('label');
  label.textContent = '🏇 Whips per Player:';
  label.style.cssText = `
    color: white;
    font-weight: bold;
    font-size: 16px;
  `;

  // Number input
  const input = document.createElement('input');
  input.type = 'number';
  input.id = 'whipCountInput';
  input.min = 1;
  input.max = 9999;
  input.value = 10; // Default
  input.style.cssText = `
    width: 90px;
    padding: 8px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 5px;
    border: 2px solid #4CAF50;
    text-align: center;
    background: white;
  `;

  // Quick buttons container
  const quickButtons = document.createElement('div');
  quickButtons.style.cssText = 'display: flex; gap: 5px;';

  // Quick button values
  const quickValues = [
    { val: 5, label: '5' },
    { val: 10, label: '10' },
    { val: 20, label: '20' },
    { val: 50, label: '50' },
    { val: 9999, label: '∞' }
  ];

  quickValues.forEach(item => {
    const btn = document.createElement('button');
    btn.textContent = item.label;
    btn.style.cssText = `
      padding: 8px 12px;
      border-radius: 5px;
      border: none;
      background: #4CAF50;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: background 0.2s;
    `;
    
    // Hover effect
    btn.onmouseenter = () => btn.style.background = '#45a049';
    btn.onmouseleave = () => btn.style.background = '#4CAF50';
    
    // Click action
    btn.onclick = () => {
      input.value = item.val;
      input.focus();
    };
    
    quickButtons.appendChild(btn);
  });

  // Assemble
  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(quickButtons);

  return container;
}

/**
 * Get the selected whip count from input
 */
export function getWhipCountFromInput() {
  const input = document.getElementById('whipCountInput');
  if (!input) return 10; // Fallback
  
  const value = parseInt(input.value);
  
  // Validation
  if (isNaN(value) || value < 1) return 10;
  if (value > 9999) return 9999;
  
  return value;
}
window.getWhipCountFromInput = getWhipCountFromInput;


// ================================
// Whip Mode Toggle (Global/Custom)
// ================================
const whipMode = document.getElementById("whipMode");
const customWhipInputs = document.getElementById("customWhipInputs");

if (whipMode && customWhipInputs) {
  whipMode.onchange = () => {
    customWhipInputs.style.display =
      whipMode.value === "custom" ? "block" : "none";
  };
}

