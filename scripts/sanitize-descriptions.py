#!/usr/bin/env python3
"""
Sanitize description fields in SKILL.md files to only allow:
- Letters (a-z, A-Z)
- Numbers (0-9)
- Spaces
- Hyphens (-)
- Periods (.)
- Commas (,)
- Parentheses ( )

Any other character is replaced with a space.
Multiple consecutive spaces are collapsed to a single space.
"""

import re
import sys
import os
from pathlib import Path

def sanitize_description(content):
    """Replace invalid characters in description field with spaces."""
    
    def clean_description(match):
        prefix = match.group(1)  # "description: "
        desc = match.group(2)    # The actual description text
        
        # Replace any character that's NOT alphanumeric, space, hyphen, period, comma, or parentheses
        # with a space
        cleaned = re.sub(r'[^a-zA-Z0-9 \-.,()]', ' ', desc)
        
        # Collapse multiple spaces into one
        cleaned = re.sub(r' +', ' ', cleaned)
        
        # Trim leading/trailing spaces
        cleaned = cleaned.strip()
        
        return f"{prefix}{cleaned}"
    
    # Match description field (single line)
    pattern = r'^(description: )(.+)$'
    new_content = re.sub(pattern, clean_description, content, flags=re.MULTILINE)
    
    return new_content

def process_file(file_path):
    """Process a single file."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    new_content = sanitize_description(content)
    
    # Only write if changes were made
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Sanitized: {file_path}")
        return True
    else:
        print(f"No changes needed: {file_path}")
        return False

def process_directory(directory):
    """Process all SKILL.md files in directory recursively."""
    directory = Path(directory)
    skill_files = list(directory.rglob('SKILL.md'))
    
    if not skill_files:
        print(f"No SKILL.md files found in {directory}")
        return
    
    print(f"Found {len(skill_files)} SKILL.md files\n")
    
    changed_count = 0
    for file_path in skill_files:
        if process_file(file_path):
            changed_count += 1
    
    print(f"\nSummary: {changed_count} files changed, {len(skill_files) - changed_count} unchanged")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        target = sys.argv[1]
    else:
        # Default to templates directory
        target = 'templates'
    
    if os.path.isfile(target):
        process_file(target)
    elif os.path.isdir(target):
        process_directory(target)
    else:
        print(f"Error: {target} is not a valid file or directory")
        sys.exit(1)
