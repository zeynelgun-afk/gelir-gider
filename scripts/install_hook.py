import os

# Ensure .git/hooks directory exists
hooks_dir = os.path.join(".git", "hooks")
if not os.path.exists(hooks_dir):
    os.makedirs(hooks_dir, exist_ok=True)

hook_path = os.path.join(hooks_dir, "pre-commit")
content = """#!/bin/sh
python scripts/increment_version.py
git add js/version.js
"""

with open(hook_path, "w") as f:
    f.write(content)

print(f"Created {hook_path}")
