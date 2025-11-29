// ===============================================
// 1) DEFINE ABILITIES HERE ONLY (1 spot)
// ===============================================
const ABILITY_LIST = [
    { name: "whip", key: "w", boost: 1.25, duration: 1.5, cooldown: 2.5, sound: "whip", charges: 10 },
    { name: "spur", key: "q", boost: 1.6,  duration: 1.2, cooldown: 5.0, sound: "spur", charges: 3 },
    { name: "pressure", key: "a", boost: 0.70, duration: 4.0, cooldown: 4.0, sound: null, charges: 5 }
];

// ===============================================
// 2) PLAYER SYSTEM (AUTO-GENERATED)
// ===============================================
export const playerSystem = {
    p1: { horse: null, enabled: false },
    p2: { horse: null, enabled: false },
    p3: { horse: null, enabled: false }
};

window.playerSystem = playerSystem;


// Attach auto fields (whipsLeft, whipCooldown, etc.)
["p1","p2","p3"].forEach(slot => {
    ABILITY_LIST.forEach(a => {
        const n = a.name.toLowerCase();
        playerSystem[slot][n + "sLeft"] = a.charges;
        playerSystem[slot][n + "Cooldown"] = 0;
    });
});


// ===============================================
// 3) ABILITY FACTORY
// ===============================================
function makeAbility(config) {

    const name = config.name.toLowerCase();

    const chargesKey  = name + "sLeft";
    const cooldownKey = name + "Cooldown";
    const boostKey    = name + "Boost";
    const timeKey     = name + "Time";
    const flashKey    = name + "Flash";

    function use(slot) {
        const p = playerSystem[slot];
        if (!p || !p.horse) return;

        if (p[chargesKey] <= 0) {
            console.log(`${slot}: No ${name} charges`);
            return;
        }

        if (p[cooldownKey] > 0) {
            console.log(`${slot}: ${name} cooldown (${p[cooldownKey].toFixed(1)}s)`);
            return;
        }

        p[chargesKey]--;
        p[cooldownKey] = config.cooldown;

        const h = p.horse;
        h[boostKey] = config.boost;
        h[timeKey]  = config.duration;
        h[flashKey] = 0.4;

        console.log(`✨ ${slot} used ${name}!`);

        if (config.sound) {
            window.soundManager.stop(config.sound);
            window.soundManager.play(config.sound);
        }
    }

    return {
        name,
        key: config.key.toLowerCase(),
        chargesKey,
        cooldownKey,
        boostKey,
        timeKey,
        flashKey,
        use
    };
}


// ===============================================
// 4) BUILD ALL ABILITIES
// ===============================================
export const ABILITIES = ABILITY_LIST.map(a => makeAbility(a));


// ===============================================
// 5) KEYBOARD CONTROL (FULLY AUTOMATIC)
// ===============================================
export function initPlayerControls() {

    window.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();

        ["p1","p2","p3"].forEach((slot, idx) => {
            const p = playerSystem[slot];
            if (!p.enabled) return;

            // Pick ability by matching key
            ABILITIES.forEach(ability => {
                if (key === ability.key) {
                    ability.use(slot);
                }
            });
        });
    });
}


// ===============================================
// 6) UPDATE PLAYER SYSTEM (ALL ABILITIES)
// ===============================================
export function updatePlayerSystem(dt, horses) {

    // Reduce cooldowns for all abilities
    ["p1","p2","p3"].forEach(slot => {
        const p = playerSystem[slot];

        ABILITIES.forEach(a => {
            p[a.cooldownKey] = Math.max(0, p[a.cooldownKey] - dt);
        });
    });

    // Update horse boosts
    horses.forEach(h => {

        ABILITIES.forEach(a => {
            const timeKey  = a.timeKey;
            const boostKey = a.boostKey;

            if (h[timeKey] > 0) {
                const dx = Math.max(0, h.x - (h._prevX || h.x));

                if (a.name === "pressure") {
                    h.x -= dx * (1 - a.boost);
                } else {
                    h.x += dx * (a.boost - 1);
                }

                h[timeKey] -= dt;
                if (h[timeKey] <= 0) {
                    h[boostKey] = 1;
                }
            }
        });
    });
}


// ===============================================
// 7) FLASH HUD (OPTIONAL)
// ===============================================
function flashHUD(slot) {
    const hud = document.querySelector(`.hud.${slot}`);
    if (hud) {
        hud.style.transform = "scale(1.1)";
        setTimeout(() => hud.style.transform = "scale(1)", 200);
    }
}
