#!/usr/bin/env python3

import os
import json
import argparse
from datetime import datetime
from github import Github, GithubException

class GitHubBranchAnalyzer:
    def __init__(self, token, repo_name, main_branch="main", release_branch="release"):
        """
        Initialize the GitHub Branch Analyzer.
        
        Args:
            token (str): GitHub Personal Access Token
            repo_name (str): Repository name in format "owner/repo"
            main_branch (str): Name of the main branch (default: "main")
            release_branch (str): Name of the release branch (default: "release")
        """
        self.token = token
        self.repo_name = repo_name
        self.main_branch = main_branch
        self.release_branch = release_branch
        
        # Initialize GitHub API client
        try:
            self.g = Github(token)
            self.repo = self.g.get_repo(repo_name)
            print(f"Successfully connected to repository: {repo_name}")
        except GithubException as e:
            print(f"Error connecting to GitHub: {e}")
            raise
        
    def get_merged_branches(self, target_branch, before_date=None):
        """
        Get all branches that were merged into the target branch via pull requests.
        
        Args:
            target_branch (str): The target branch to check (e.g., "main" or "release")
            before_date (str, optional): ISO format date string (YYYY-MM-DD) to filter PRs merged before this date
            
        Returns:
            list: List of branch names that were merged into the target branch
        """
        print(f"Fetching pull requests merged into {target_branch}...")
        if before_date:
            print(f"Filtering for PRs merged before {before_date}")
            before_datetime = datetime.fromisoformat(before_date)
        else:
            before_datetime = None
        
        # Get all closed pull requests that were merged into the target branch
        try:
            pulls = self.repo.get_pulls(state='closed', base=target_branch)
            print(f"Found {pulls.totalCount} closed pull requests for {target_branch}")
        except GithubException as e:
            print(f"Error fetching pull requests: {e}")
            return [], []
        
        # Extract the source branch names from the merged pull requests
        merged_branches = []
        branch_details = []
        
        for pr in pulls:
            try:
                if not pr.merged:
                    continue
                    
                # Skip if PR was merged after the specified date
                if before_datetime and pr.merged_at > before_datetime:
                    continue
                    
                # Extract the source branch name
                source_branch = pr.head.ref
                
                # Check if it matches the feature/xxx-123 pattern
                if source_branch.startswith("feature/"):
                    branch_info = {
                        "name": source_branch,
                        "merged_at": pr.merged_at.isoformat(),
                        "pr_number": pr.number,
                        "pr_title": pr.title,
                        "pr_url": pr.html_url,
                        "author": pr.user.login if pr.user else "Unknown"
                    }
                    branch_details.append(branch_info)
                    merged_branches.append(source_branch)
                    print(f"Found merged branch: {source_branch} (merged on {pr.merged_at})")
            except GithubException as e:
                print(f"Error processing pull request #{pr.number}: {e}")
                continue
        
        return merged_branches, branch_details
    
    def analyze_branches(self, before_date=None):
        """
        Analyze branches and generate comparison data.
        
        Args:
            before_date (str, optional): ISO format date string (YYYY-MM-DD) to filter PRs merged before this date
            
        Returns:
            dict: Branch comparison data
        """
        # Get branches merged into main
        main_branch_names, main_branches_details = self.get_merged_branches(self.main_branch, before_date)
        
        # Get branches merged into release
        release_branch_names, release_branches_details = self.get_merged_branches(self.release_branch, before_date)
        
        # Find common branches
        common_branches = list(set(main_branch_names) & set(release_branch_names))
        
        # Find branches only in main
        main_only = list(set(main_branch_names) - set(release_branch_names))
        
        # Find branches only in release
        release_only = list(set(release_branch_names) - set(main_branch_names))
        
        # Create result data structure
        result = {
            "main": main_branch_names,
            "release": release_branch_names,
            "common": common_branches,
            "mainOnly": main_only,
            "releaseOnly": release_only,
            "mainDetails": main_branches_details,
            "releaseDetails": release_branches_details,
            "timestamp": datetime.now().isoformat(),
            "repository": self.repo_name,
            "analysisDate": before_date if before_date else "latest"
        }
        
        return result
    
    def save_results(self, before_date=None, output_file=None):
        """
        Analyze branches and save results to a JSON file.
        
        Args:
            before_date (str, optional): ISO format date string (YYYY-MM-DD) to filter PRs merged before this date
            output_file (str, optional): Path to the output JSON file
            
        Returns:
            dict: Branch comparison data
        """
        result = self.analyze_branches(before_date)
        
        # Determine output filename if not provided
        if output_file is None:
            if before_date:
                date_str = before_date.replace("-", "")
                output_file = f"branch_data_{date_str}.json"
            else:
                output_file = "branch_data.json"
        
        # Save to JSON file
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
            
        print(f"Results saved to {output_file}")
        return result

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Analyze GitHub repository branches with date filtering')
    parser.add_argument('--date', type=str, help='Analysis date in ISO format (YYYY-MM-DD)')
    parser.add_argument('--output', type=str, help='Output file path')
    parser.add_argument('--token', type=str, help='GitHub Personal Access Token')
    parser.add_argument('--repo', type=str, help='Repository name (owner/repo)')
    parser.add_argument('--main-branch', type=str, help='Main branch name')
    parser.add_argument('--release-branch', type=str, help='Release branch name')
    args = parser.parse_args()
    
    # Check for token and repo in args or environment variables
    token = args.token or os.environ.get("GITHUB_TOKEN")
    repo_name = args.repo or os.environ.get("GITHUB_REPO")
    main_branch = args.main_branch or os.environ.get("MAIN_BRANCH", "main")
    release_branch = args.release_branch or os.environ.get("RELEASE_BRANCH", "release")
    
    if not token or not repo_name:
        print("Error: GitHub token and repository name must be provided.")
        print("You can provide them as command line arguments or environment variables:")
        print("  --token TOKEN or GITHUB_TOKEN environment variable")
        print("  --repo OWNER/REPO or GITHUB_REPO environment variable")
        return 1
    
    try:
        # Create analyzer and run analysis
        analyzer = GitHubBranchAnalyzer(token, repo_name, main_branch, release_branch)
        analyzer.save_results(args.date, args.output)
        return 0
    except Exception as e:
        print(f"Error during analysis: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
