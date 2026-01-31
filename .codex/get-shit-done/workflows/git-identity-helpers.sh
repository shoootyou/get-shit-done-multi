#!/usr/bin/env bash
# Git identity preservation helpers
# Used by agents to commit with user identity instead of agent name

# Read git identity from config hierarchy (git config → config.json)
# Returns: Two lines - name on line 1, email on line 2
# Exit code: 0 on success, 1 if identity not found
read_git_identity() {
    local name email
    
    # Try git config first (respects global → local hierarchy)
    name=$(git config user.name 2>/dev/null)
    email=$(git config user.email 2>/dev/null)
    
    # Fallback to project config.json
    if [ -z "$name" ] || [ -z "$email" ]; then
        if [ -f .planning/config.json ]; then
            # Simple grep-based extraction (no jq dependency)
            name=$(grep -A 3 '"git"' .planning/config.json | \
                   grep '"name"' | head -1 | cut -d'"' -f4)
            email=$(grep -A 4 '"git"' .planning/config.json | \
                    grep '"email"' | head -1 | cut -d'"' -f4)
        fi
    fi
    
    # Validate results
    if [ -z "$name" ] || [ -z "$email" ]; then
        echo "ERROR: Git identity not configured" >&2
        echo "Please run: git config --global user.name 'Your Name'" >&2
        echo "           git config --global user.email 'you@example.com'" >&2
        return 1
    fi
    
    # Basic email validation (contains @)
    if [[ ! "$email" =~ "@" ]]; then
        echo "ERROR: Invalid email format: $email" >&2
        return 1
    fi
    
    # Return both values
    echo "$name"
    echo "$email"
}

# Commit with user identity preservation
# Usage: commit_as_user "commit message"
# Sets all 4 env vars (author + committer) to override platform behavior
commit_as_user() {
    local commit_message="$1"
    
    if [ -z "$commit_message" ]; then
        echo "ERROR: commit_as_user requires commit message" >&2
        return 1
    fi
    
    # Read identity (stores output in array via mapfile)
    local identity_output
    identity_output=$(read_git_identity) || return 1
    
    # Parse into separate variables
    local git_name git_email
    git_name=$(echo "$identity_output" | head -1)
    git_email=$(echo "$identity_output" | tail -1)
    
    # Commit with identity override (highest precedence)
    # Must set all 4 variables to fully override platform behavior
    GIT_AUTHOR_NAME="$git_name" \
    GIT_AUTHOR_EMAIL="$git_email" \
    GIT_COMMITTER_NAME="$git_name" \
    GIT_COMMITTER_EMAIL="$git_email" \
    git commit -m "$commit_message"
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo "ERROR: git commit failed with exit code $exit_code" >&2
        return $exit_code
    fi
    
    return 0
}

# Export functions for use in subshells
export -f read_git_identity
export -f commit_as_user
