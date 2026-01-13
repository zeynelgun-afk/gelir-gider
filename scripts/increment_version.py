import re
import os

VERSION_FILE = os.path.join("js", "version.js")

def increment_version():
    if not os.path.exists(VERSION_FILE):
        print(f"Error: {VERSION_FILE} not found.")
        return

    with open(VERSION_FILE, "r") as f:
        content = f.read()

    # Regex to find: const APP_VERSION = "0.0.1";
    match = re.search(r'const APP_VERSION = "(\d+)\.(\d+)\.(\d+)";', content)
    
    if match:
        major, minor, patch = map(int, match.groups())
        new_patch = patch + 1
        new_version = f"{major}.{minor}.{new_patch}"
        
        new_content = re.sub(
            r'const APP_VERSION = "\d+\.\d+\.\d+";',
            f'const APP_VERSION = "{new_version}";',
            content
        )
        
        with open(VERSION_FILE, "w") as f:
            f.write(new_content)
            
        print(f"Version incremented to {new_version}")
    else:
        print("Error: Could not parse version in js/version.js")

if __name__ == "__main__":
    increment_version()
