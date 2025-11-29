// ===========================
// SOUND MANAGER
// ===========================

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5; // 50% volume by default
  }
  
  // Load a sound file
loadSound(name, path, customVolume) {
  const audio = new Audio(path);
  audio.volume = customVolume !== undefined ? customVolume : this.volume;
  this.sounds[name] = audio;
}
  
  // Play a sound
play(name, loop = false, delayBetweenLoops = 0) {  // Add delay parameter
  if (!this.enabled) return;
  
  const sound = this.sounds[name];
  if (!sound) {
    console.warn(`⚠️ Sound not found: ${name}`);
    return;
  }
  
  sound.currentTime = 0;
  
  if (loop && delayBetweenLoops > 0) {
    // Custom looping with delay
    sound.loop = false;
    sound.play().catch(err => console.log(`Sound play blocked: ${err}`));
    
    sound.onended = () => {
      setTimeout(() => {
        if (this.enabled && sound) {
          sound.currentTime = 0;
          sound.play();
        }
      }, delayBetweenLoops * 1000);  // Convert seconds to milliseconds
    };
  } else {
    sound.loop = loop;
    sound.play().catch(err => console.log(`Sound play blocked: ${err}`));
  }
}

  
  // Stop a sound
  stop(name) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
  
  // Toggle sound on/off
// Toggle sound on/off
toggle() {
  this.enabled = !this.enabled;
  
  if (!this.enabled) {
    // Turning OFF - stop all sounds
    this.stopAll();
  } else {
    // Turning ON - restart race sounds if race is active
    if (window.raceActive && !window.raceFinished) {
      // Restart gallop and crowd if race is running
      this.play('gallop', true);
      this.play('crowd', true, 10);
    }
  }
  
  console.log(`🔊 Sounds ${this.enabled ? 'enabled' : 'disabled'}`);
}
  
  // Stop all sounds
  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
  
  // Set volume (0.0 to 1.0)
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }
}

// Create global sound manager
window.soundManager = new SoundManager();

// Load sounds (files don't exist yet, but code is ready)
window.soundManager.loadSound('gallop', 'assets/sounds/gallop.mp3', 0.05);
window.soundManager.loadSound('crowd', 'assets/sounds/crowd.mp3', 0.2);  // ← FIX THIS!
window.soundManager.loadSound('finish', 'assets/sounds/finish.mp3');
window.soundManager.loadSound('whip', 'assets/sounds/whip.mp3');
window.soundManager.loadSound('spur', 'assets/sounds/whip.mp3');
window.soundManager.loadSound('start', 'assets/sounds/start.mp3', 0.4);  // ← ADD THIS
// ==== Sedat Voice Lines (pre-recorded) ====
window.soundManager.loadSound('sedat_start', 'assets/sounds/sedat/start.mp3', 1.0);
window.soundManager.loadSound('sedat_lead', 'assets/sounds/sedat/lead.mp3', 1.0);
window.soundManager.loadSound('sedat_push', 'assets/sounds/sedat/push.mp3', 1.0);
window.soundManager.loadSound('sedat_finish', 'assets/sounds/sedat/finish.mp3');
window.soundManager.loadSound('sedat_final', 'assets/sounds/sedat/final.mp3', 1.0);
window.soundManager.loadSound('sedat_wins', 'assets/sounds/sedat/wins.mp3', 1.0);



console.log('✅ Sound Manager loaded');


// ===============================
// Load Sedat horse name voices
// ===============================
function loadSedatHorseNameVoices() {
    if (!window.HORSE_DATA) {
        console.warn("⚠️ HORSE_DATA not loaded yet");
        return;
    }

    window.HORSE_DATA.forEach(horse => {
        // Convert spaces to underscores
        const fileName = horse.name.replace(/ /g, "_");

        // Store sound as: sedat_name_Windy_Storm
        window.soundManager.loadSound(
            `sedat_name_${fileName}`,
            `assets/sounds/horses/${fileName}.mp3`,
            1.00 // louder than background
        );
    });

}

// Call after soundManager is created
setTimeout(loadSedatHorseNameVoices, 500);


function loadSedatPositionVoices() {
    // Fetch the position.csv file
    fetch('assets/sounds/positions/position.csv')
        .then(response => response.text())
        .then(csvText => {
            // Parse CSV
            const lines = csvText.trim().split('\n');
            
            // Skip first row if it has header (like 'x')
            const startIndex = lines[0].trim().toLowerCase() === 'x' ? 1 : 0;
            
            // Load each position sound
            for (let i = startIndex; i < lines.length; i++) {
                const positionName = lines[i].trim();
                if (positionName) {
                    const fileName = positionName.replace(/ /g, "_");
                    
                    // Store sound as: sedat_position_first, sedat_position_second, etc.
                    window.soundManager.loadSound(
                        `sedat_position_${fileName}`,
                        `assets/sounds/positions/${fileName}.mp3`,
                        1.00
                    );
                }
            }
        })
        .catch(error => {
            console.error("⚠️ Error loading position.csv:", error);
        });
}

// Call after soundManager is created
setTimeout(loadSedatPositionVoices, 500);

