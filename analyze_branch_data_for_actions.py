#!/usr/bin/env python3

import json
import os
import sys
import argparse
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
        'analysis_time': datetime.now().isoformat(),
        'analysis_date': data.get('analysisDate', 'latest')
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
    
    # Add GitHub Actions specific metadata
    if 'GITHUB_REPOSITORY' in os.environ:
        stats['github_repository'] = os.environ['GITHUB_REPOSITORY']
    if 'GITHUB_WORKFLOW' in os.environ:
        stats['github_workflow'] = os.environ['GITHUB_WORKFLOW']
    if 'GITHUB_RUN_ID' in os.environ:
        stats['github_run_id'] = os.environ['GITHUB_RUN_ID']
    if 'GITHUB_SHA' in os.environ:
        stats['github_commit'] = os.environ['GITHUB_SHA']
    
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
    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Analysis results saved to {output_file}")
    except Exception as e:
        print(f"Error saving results to {output_file}: {e}")
        sys.exit(1)

def print_analysis_summary(data):
    """
    Print a summary of the analysis results.
    
    Args:
        data (dict): Analysis results
    """
    stats = data['stats']
    
    print("\n" + "="*50)
    print(f"BRANCH ANALYSIS SUMMARY FOR {stats['repository']}")
    if stats.get('analysis_date') and stats['analysis_date'] != 'latest':
        print(f"Analysis Date: {stats['analysis_date']}")
    print("="*50)
    print(f"Total unique branches: {stats['total_branches']}")
    print(f"Branches in main: {stats['main_count']}")
    print(f"Branches in release: {stats['release_count']}")
    print(f"Common branches: {stats['common_count']} ({stats['common_percentage']}%)")
    print(f"Branches only in main: {stats['main_only_count']} ({stats['main_only_percentage']}%)")
    print(f"Branches only in release: {stats['release_only_count']} ({stats['release_only_percentage']}%)")
    print("="*50)
    
    # Print branch lists (limited to first 5 for brevity in CI logs)
    print("\nBranches in main (first 5):")
    for branch in data['main'][:5]:
        print(f"  - {branch}")
    if len(data['main']) > 5:
        print(f"  ... and {len(data['main']) - 5} more")
    
    print("\nBranches in release (first 5):")
    for branch in data['release'][:5]:
        print(f"  - {branch}")
    if len(data['release']) > 5:
        print(f"  ... and {len(data['release']) - 5} more")
    
    print("\nCommon branches (first 5):")
    for branch in data['common'][:5]:
        print(f"  - {branch}")
    if len(data['common']) > 5:
        print(f"  ... and {len(data['common']) - 5} more")

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Analyze branch data with date filtering for GitHub Actions')
    parser.add_argument('input_file', nargs='?', default='branch_data.json', help='Input JSON file path')
    parser.add_argument('output_file', nargs='?', help='Output JSON file path')
    parser.add_argument('--verbose', action='store_true', help='Print verbose output')
    args = parser.parse_args()
    
    # Default input and output files
    input_file = args.input_file
    
    # Determine output filename if not provided
    if args.output_file:
        output_file = args.output_file
    else:
        # If input file has date in name, use same pattern for output
        if '_' in input_file and input_file.startswith('branch_data_'):
            date_part = input_file.split('branch_data_')[1]
            output_file = f"analyzed_branch_data_{date_part}"
        else:
            output_file = "analyzed_branch_data.json"
    
    print(f"Loading branch data from {input_file}...")
    data = load_branch_data(input_file)
    
    print("Analyzing branch data...")
    analyzed_data = analyze_branch_data(data)
    
    # Save analysis results
    save_analysis_results(analyzed_data, output_file)
    
    # Print summary
    if args.verbose:
        print_analysis_summary(analyzed_data)
    else:
        stats = analyzed_data['stats']
        print(f"\nAnalysis complete for {stats['repository']}")
        if stats.get('analysis_date') and stats['analysis_date'] != 'latest':
            print(f"Analysis Date: {stats['analysis_date']}")
        print(f"Total branches: {stats['total_branches']}")
        print(f"Main: {stats['main_count']}, Release: {stats['release_count']}, Common: {stats['common_count']}")
    
    print(f"\nResults saved to {output_file}")
    return 0

if __name__ == "__main__":
    exit(main())
