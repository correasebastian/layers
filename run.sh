#!/bin/bash

# Run script for GitHub Branch Analyzer
# This script runs the analyzer with the configured settings

# Check if .env file exists and source it
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found. Please run ./configure.sh first."
    exit 1
fi

# Check if required variables are set
if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_REPO" ]; then
    echo "Error: GITHUB_TOKEN and GITHUB_REPO must be set in .env file."
    echo "Please run ./configure.sh to configure these variables."
    exit 1
fi

echo "Running GitHub Branch Analyzer for repository: $GITHUB_REPO"
echo "Comparing branches: $MAIN_BRANCH and $RELEASE_BRANCH"

# Run the Python script
python github_branch_analyzer.py

# Check if the analysis was successful
if [ $? -eq 0 ]; then
    echo "Analysis completed successfully!"
    echo "Results saved to branch_data.json"
    
    # Copy the data to the visualization directory
    if [ -d "../git-branch-comparison-website" ]; then
        cp branch_data.json ../git-branch-comparison-website/
        echo "Data copied to visualization website directory."
    else
        echo "Note: Visualization website directory not found."
    fi
else
    echo "Error: Analysis failed. Please check the error messages above."
fi
