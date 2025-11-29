// ===========================
// SETTINGS UI
// ===========================

import { spriteConfig, updateSpriteConfig } from '../config/sprite_config.js';

/**
 * Create settings panel HTML
 */
export function createSettingsPanel() {
  const panelHTML = `
    <div id="ui">
      <h3>🏇 Sprite Horse Racing</h3>
    
      <div class="row">
        <label>Frames</label>
        <input id="framesInput" type="number" min="2" max="32" />
      </div>
      <div class="row">
        <label>Scale</label>
        <input id="scaleInput" type="number" min="0.2" max="4" step="0.1" />
      </div>

      <hr style="border:none;height:1px;background:rgba(255,255,255,.25);margin:10px 0">

      <h4 style="margin:8px 0">🎨 Sprite</h4>
      <div class="row">
        <label>Files</label>
        <input id="spriteFiles" type="file" accept="image/*" multiple>
      </div>

      <div id="spritePreview" class="tiny" style="margin-top:8px;line-height:1.4"></div>

      <div class="tiny">Tip: If the horse looks too small/large, change <b>Scale</b>.</div>

      <hr style="border:none;height:1px;background:rgba(255,255,255,.25);margin:10px 0">

      <div id="leaderboard"></div>

      <hr style="border:none;height:1px;background:rgba(255,255,255,.25);margin:10px 0">

      <div id="completeStatsInline" class="hidden"></div>

      <hr style="border:none;height:1px;background:rgba(255,255,255,.25);margin:10px 0">
      <h4 style="margin:8px 0">💾 Export Settings</h4>
      <button id="downloadRaceHistoryBtn" style="font-size:12px;padding:6px 12px;width:100%;background:#FF9800;margin-bottom:6px">Download racehistory.js</button>
    </div>
  `;
  
  // Insert into body
  const container = document.createElement('div');
  container.innerHTML = panelHTML;
  document.body.appendChild(container.firstElementChild);
}

/**
 * Initialize settings panel inputs
 */
export function initSettingsPanel() {
  const framesInput = document.getElementById('framesInput');
  const scaleInput = document.getElementById('scaleInput');
  
  if (framesInput) {
    framesInput.value = spriteConfig.frames;
    framesInput.oninput = () => {
      const frames = Math.max(2, Math.min(32, +framesInput.value || spriteConfig.frames));
      updateSpriteConfig({ frames });
    };
  }
  
  if (scaleInput) {
    scaleInput.value = spriteConfig.scale;
    scaleInput.oninput = () => {
      const scale = Math.max(0.2, Math.min(4, +scaleInput.value || spriteConfig.scale));
      updateSpriteConfig({ scale });
    };
  }
}

/**
 * Setup sprite file upload
 */
export function setupSpriteUpload(horses, refreshCallback) {
  const spriteFileInput = document.getElementById('spriteFiles');
  const spritePreviewEl = document.getElementById('spritePreview');
  
  if (spriteFileInput) {
    spriteFileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length) {
        applySpriteFiles(files, horses, spritePreviewEl, refreshCallback);
      }
    });
  }
  
  // Drag & drop support
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = Array.from(e.dataTransfer?.files || []).find(f => f.type.startsWith('image/'));
    if (file) {
      applySpriteFiles([file], horses, spritePreviewEl, refreshCallback);
    }
  });
}

/**
 * Apply sprite files to all horses
 */
function applySpriteFiles(files, horses, previewEl, refreshCallback) {
  const file = (files && files[0]) || null;
  if (!file || !file.type?.startsWith('image/')) return;
  
  const url = URL.createObjectURL(file);
  const img = new Image();
  
  img.onload = () => {
    // Assign same image to all horses
    horses.forEach(h => {
      h.sprite = { img };
    });
    
    // Update UI
    if (refreshCallback) refreshCallback();
    
    // Show preview
    if (previewEl) {
      const purl = URL.createObjectURL(file);
      previewEl.innerHTML = `
        <div style="margin:4px 0;padding:6px;background:rgba(0,0,0,0.18);border-radius:6px">
          <div><b>All horses</b> <span style="opacity:.7">(same file)</span></div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
            <img src="${purl}" style="height:28px;border-radius:4px;box-shadow:0 0 0 1px rgba(255,255,255,.2)">
            <span class="tiny" style="opacity:.8">${file.name}</span>
          </div>
        </div>`;
      setTimeout(() => URL.revokeObjectURL(purl), 30000);
    }
    
    URL.revokeObjectURL(url);
  };
  
  img.src = url;
}

/**
 * Setup UI toggle button
 */
export function setupUIToggle() {
  const toggleUIBtn = document.getElementById('toggleUI');
  const uiPanel = document.getElementById('ui');
  
  if (toggleUIBtn && uiPanel) {
    uiPanel.classList.add('hidden'); // Start hidden
    
    toggleUIBtn.onclick = () => {
      uiPanel.classList.toggle('hidden');
      toggleUIBtn.textContent = uiPanel.classList.contains('hidden') 
        ? 'Show Settings ⚙️' 
        : 'Hide Settings ⚙️';
    };
  }
}