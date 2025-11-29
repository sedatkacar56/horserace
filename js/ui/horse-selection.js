// ===========================
// HORSE SELECTION UI
// ===========================

/**
 * Create horse selection modal HTML
 */
export function createHorseSelectionModal() {
  const modalHTML = `
    <div id="horseSelection" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
         background:rgba(0,0,0,0.95);padding:30px;border-radius:16px;z-index:10000;display:none;
         max-width:600px;max-height:80vh;overflow-y:auto;">
      <h2 style="color:#FFD700;margin:0 0 20px 0;text-align:center;">🏇 Select Your Horses</h2>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <!-- Player 1 Selection -->
        <div style="background:rgba(76,175,80,0.2);padding:15px;border:3px solid #4CAF50;border-radius:10px;">
          <h3 style="color:#4CAF50;margin:0 0 10px 0;">PLAYER 1 (W Key)</h3>
          <select id="p1HorseSelect" style="width:100%;padding:8px;border-radius:6px;font-size:14px;background:#fff;border:2px solid #4CAF50;">
            <option value="">Choose horse...</option>
          </select>
        </div>
        
        <!-- Player 2 Selection -->
        <div style="background:rgba(33,150,243,0.2);padding:15px;border:3px solid #2196F3;border-radius:10px;">
          <h3 style="color:#2196F3;margin:0 0 10px 0;">PLAYER 2 (I Key)</h3>
          <select id="p2HorseSelect" style="width:100%;padding:8px;border-radius:6px;font-size:14px;background:#fff;border:2px solid #2196F3;">
            <option value="">Choose horse...</option>
          </select>
        </div>
      </div>
      
      <button id="confirmSelection" style="width:100%;padding:12px;background:#4CAF50;color:#fff;
              border:none;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;">
        ✅ Start Race (With Selected Players)
      </button>
      <button id="cancelSelection" style="width:100%;padding:10px;background:#666;color:#fff;
              border:none;border-radius:8px;font-size:14px;margin-top:10px;cursor:pointer;">
        Skip & Start Without Players
      </button>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}