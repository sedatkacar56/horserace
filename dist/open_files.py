import os
import subprocess

# === PATH TO YOUR PORTABLE NOTEPAD++ ===
NOTEPAD_PATH = r"C:\Users\skacar\Downloads\npp.8.8.8.portable.x64\notepad++.exe"

# === PROJECT ROOT (CHANGE IF DIFFERENT) ===
ROOT = r"C:\Users\skacar\Documents\horse_race\horserace_organizes"

# === FILES YOU WANT TO ACCESS ===
FILES = [
    ("CSS - index.html",                      r"index.html"),
    ("Main - main.js",                        r"js\main.js"),
    ("Game - race-manager.js",                r"js\game\race-manager.js"),
    ("Features - strategies.js",              r"js\features\strategies\strategies.js"),
    ("Features - player-system.js",           r"js\features\player-system.js"),
    ("Features - ai-commentary.js",           r"js\features\ai-commentary.js"),
    ("Features - commentary-system.js",       r"js\features\commentary-system.js"),
    ("UI - controls-ui.js",                   r"js\ui\controls-ui.js"),
    ("UI - race-results.js",                  r"js\ui\race-results.js"),
    ("UI - horse-selection.js",               r"js\ui\horse-selection.js"),
    ("UI - leaderboard.js",                   r"js\ui\leaderboard.js"),
    ("UI - settings-ui.js",                   r"js\ui\settings-ui.js"),
    ("UI - whip-hud.js",                      r"js\ui\whip-hud.js"),
    ("CSS - styles.css",                      r"css\styles.css"),
    ("Core - sound-manager.js",               r"js\core\sound-manager.js"),
    ("Core - canvas.js",                      r"js\core\canvas.js"),
    ("Core - sprite-cache.js",                r"js\core\sprite-cache.js"),
    ("Core - sprite-renderer.js",             r"js\core\sprite-renderer.js"),
    ("Core - track.js",                       r"js\core\track.js"),
    ("Config - sprite_config.js",             r"js\config\sprite_config.js"),
    ("Data - horses.js",                      r"js\data\horses.js"),
    ("Config - race_params.js",               r"js\config\race_params.js"),
]

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_menu():
    clear()
    print("=== Open Project Files (Notepad++) ===\n")
    for i, (name, path) in enumerate(FILES, start=1):
        print(f"{i}. {name}")
    print("\n0. Exit\n")

def main():
    while True:
        print_menu()
        choice = input("Choose file number: ").strip()

        if choice == "0":
            print("Goodbye Sedat! Elhamdulillah.")
            break

        if not choice.isdigit() or not (1 <= int(choice) <= len(FILES)):
            input("❌ Invalid choice. Press Enter to continue...")
            continue

        idx = int(choice) - 1
        label, relative_path = FILES[idx]
        full_path = os.path.join(ROOT, relative_path)

        if not os.path.exists(full_path):
            input(f"❌ File not found: {full_path}\nPress Enter...")
            continue

        print(f"\n✓ Opening: {label}")
        subprocess.Popen([NOTEPAD_PATH, full_path])

        input("\nPress Enter to open another file...")

if __name__ == "__main__":
    main()
