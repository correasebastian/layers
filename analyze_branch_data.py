#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime

def load_branch_data(file_path):
    """
    Load branch data from JSON file.
    
    Args:
        file_path (str): Path to the JSON file containing branch data
        
    Returns:
        dict: Branch data
    """
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"Error: File {file_path} not found.")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: File {file_path} is not valid JSON.")
        sys.exit(1)

def analyze_branch_data(data):
    """
    Analyze branch data and generate statistics.
    
    Args:
        data (dict): Branch data
        
    Returns:
        dict: Analysis results
    """
    # Verify data structure
    required_keys = ['main', 'release', 'common', 'mainOnly', 'releaseOnly']
    for key in required_keys:
        if key not in data:
            print(f"Error: Missing required key '{key}' in branch data.")
            sys.exit(1)
    
    # Calculate statistics
    stats = {
        'total_branches': len(set(data['main'] + data['release'])),
        'main_count': len(data['main']),
        'release_count': len(data['release']),
        'common_count': len(data['common']),
        'main_only_count': len(data['mainOnly']),
        'release_only_count': len(data['releaseOnly']),
        'repository': data.get('repository', 'Unknown'),
        'timestamp': data.get('timestamp', datetime.now().isoformat()),
        'analysis_time': datetime.now().isoformat()
    }
    
    # Calculate percentages
    if stats['total_branches'] > 0:
        stats['common_percentage'] = round(stats['common_count'] / stats['total_branches'] * 100, 1)
        stats['main_only_percentage'] = round(stats['main_only_count'] / stats['total_branches'] * 100, 1)
        stats['release_only_percentage'] = round(stats['release_only_count'] / stats['total_branches'] * 100, 1)
    else:
        stats['common_percentage'] = 0
        stats['main_only_percentage'] = 0
        stats['release_only_percentage'] = 0
    
    # Combine with original data
    result = {**data, 'stats': stats}
    return result

def save_analysis_results(data, output_file):
    """
    Save analysis results to a JSON file.
    
    Args:
        data (dict): Analysis results
        output_file (str): Path to the output JSON file
    """
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Analysis results saved to {output_file}")

def print_analysis_summary(data):
    """
    Print a summary of the analysis results.
    
    Args:
        data (dict): Analysis results
    """
    stats = data['stats']
    
    print("\n" + "="*50)
    print(f"BRANCH ANALYSIS SUMMARY FOR {stats['repository']}")
    print("="*50)
    print(f"Total unique branches: {stats['total_branches']}")
    print(f"Branches in main: {stats['main_count']}")
    print(f"Branches in release: {stats['release_count']}")
    print(f"Common branches: {stats['common_count']} ({stats['common_percentage']}%)")
    print(f"Branches only in main: {stats['main_only_count']} ({stats['main_only_percentage']}%)")
    print(f"Branches only in release: {stats['release_only_count']} ({stats['release_only_percentage']}%)")
    print("="*50)
    
    # Print branch lists
    print("\nBranches in main:")
    for branch in data['main']:
        print(f"  - {branch}")
    
    print("\nBranches in release:")
    for branch in data['release']:
        print(f"  - {branch}")
    
    print("\nCommon branches:")
    for branch in data['common']:
        print(f"  - {branch}")
    
    print("\nBranches only in main:")
    for branch in data['mainOnly']:
        print(f"  - {branch}")
    
    print("\nBranches only in release:")
    for branch in data['releaseOnly']:
        print(f"  - {branch}")

def main():
    # Default input and output files
    input_file = "branch_data.json"
    output_file = "analyzed_branch_data.json"
    
    # Check command line arguments
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    print(f"Loading branch data from {input_file}...")
    data = load_branch_data(input_file)
    
    print("Analyzing branch data...")
    analyzed_data = analyze_branch_data(data)
    
    # Save analysis results
    save_analysis_results(analyzed_data, output_file)
    
    # Print summary
    print_analysis_summary(analyzed_data)
    
    print(f"\nAnalysis complete. Results saved to {output_file}")

if __name__ == "__main__":
    main()
