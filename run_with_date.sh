#!/bin/bash

# Run script for GitHub Branch Analyzer with date filtering
# This script runs the analyzer with the configured settings and date parameter

# Check if .env file exists and source it
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found. Please run ./configure_with_date.sh first."
    exit 1
fi

# Check if required variables are set
if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_REPO" ]; then
    echo "Error: GITHUB_TOKEN and GITHUB_REPO must be set in .env file."
    echo "Please run ./configure_with_date.sh to configure these variables."
    exit 1
fi

echo "Running GitHub Branch Analyzer for repository: $GITHUB_REPO"
echo "Comparing branches: $MAIN_BRANCH and $RELEASE_BRANCH"

# Determine output filename based on date
if [ -n "$ANALYSIS_DATE" ]; then
    DATE_STR=$(echo $ANALYSIS_DATE | tr -d '-')
    OUTPUT_FILE="branch_data_${DATE_STR}.json"
    ANALYZED_OUTPUT_FILE="analyzed_branch_data_${DATE_STR}.json"
    echo "Analysis date: $ANALYSIS_DATE"
    echo "Output will be saved to: $OUTPUT_FILE"
else
    OUTPUT_FILE="branch_data.json"
    ANALYZED_OUTPUT_FILE="analyzed_branch_data.json"
    echo "Analysis date: latest (no date filter)"
    echo "Output will be saved to: $OUTPUT_FILE"
fi

# Run the Python script with date parameter if provided
if [ -n "$ANALYSIS_DATE" ]; then
    python github_branch_analyzer_with_date.py --date "$ANALYSIS_DATE" --output "$OUTPUT_FILE"
else
    python github_branch_analyzer_with_date.py --output "$OUTPUT_FILE"
fi

# Check if the analysis was successful
if [ $? -eq 0 ]; then
    echo "Analysis completed successfully!"
    echo "Results saved to $OUTPUT_FILE"
    
    # Run the analysis script to add statistics
    echo "Adding statistics to the data..."
    python analyze_branch_data_with_date.py "$OUTPUT_FILE" "$ANALYZED_OUTPUT_FILE"
    
    if [ $? -eq 0 ]; then
        echo "Statistics added successfully!"
        echo "Final results saved to $ANALYZED_OUTPUT_FILE"
        
        # Copy the data to the visualization directory
        if [ -d "../git-branch-comparison-website" ]; then
            cp "$ANALYZED_OUTPUT_FILE" ../git-branch-comparison-website/
            echo "Data copied to visualization website directory."
        else
            echo "Note: Visualization website directory not found."
        fi
    else
        echo "Error: Failed to add statistics. Please check the error messages above."
    fi
else
    echo "Error: Analysis failed. Please check the error messages above."
fi
