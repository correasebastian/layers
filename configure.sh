#!/bin/bash

# Configuration script for GitHub Branch Analyzer
# This script sets up the environment variables needed for the analyzer

# Check if .env file exists and source it if it does
if [ -f .env ]; then
    source .env
fi

# Function to prompt for input with a default value
prompt_with_default() {
    local prompt=$1
    local default=$2
    local input
    
    echo -n "$prompt [$default]: "
    read input
    echo "${input:-$default}"
}

# Prompt for GitHub token if not set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "GitHub Personal Access Token is required to access private repositories."
    echo "You can create one at: https://github.com/settings/tokens"
    echo "Ensure it has 'repo' permissions to access private repositories."
    read -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
fi

# Prompt for repository name if not set
if [ -z "$GITHUB_REPO" ]; then
    GITHUB_REPO=$(prompt_with_default "Enter repository name (format: owner/repo)" "")
fi

# Prompt for branch names
MAIN_BRANCH=$(prompt_with_default "Enter main branch name" "main")
RELEASE_BRANCH=$(prompt_with_default "Enter release branch name" "release")

# Save to .env file
cat > .env << EOF
GITHUB_TOKEN=$GITHUB_TOKEN
GITHUB_REPO=$GITHUB_REPO
MAIN_BRANCH=$MAIN_BRANCH
RELEASE_BRANCH=$RELEASE_BRANCH
EOF

echo "Configuration saved to .env file"
echo "To run the analyzer, use: python github_branch_analyzer.py"

# Make the .env file readable only by the owner
chmod 600 .env

# Export variables for immediate use
export GITHUB_TOKEN
export GITHUB_REPO
export MAIN_BRANCH
export RELEASE_BRANCH
