import os
import json
import argparse
from datetime import datetime
from github import Github

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
        self.g = Github(token)
        self.repo = self.g.get_repo(repo_name)
        
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
        
        # Get all closed pull requests that were merged into the target branch
        pulls = self.repo.get_pulls(state='closed', base=target_branch)
        
        # Extract the source branch names from the merged pull requests
        merged_branches = []
        for pr in pulls:
            if pr.merged:
                # Skip if PR was merged after the specified date
                if before_date and pr.merged_at > datetime.fromisoformat(before_date):
                    continue
                    
                # Extract the source branch name
                source_branch = pr.head.ref
                # Check if it matches the feature/xxx-123 pattern
                if source_branch.startswith("feature/"):
                    merged_branches.append({
                        "name": source_branch,
                        "merged_at": pr.merged_at.isoformat(),
                        "pr_number": pr.number,
                        "pr_title": pr.title
                    })
                    print(f"Found merged branch: {source_branch} (merged on {pr.merged_at})")
        
        # Extract just the branch names for backward compatibility
        branch_names = [branch["name"] for branch in merged_branches]
        return branch_names, merged_branches
    
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
    args = parser.parse_args()
    
    # Check if environment variables are set
    token = os.environ.get("GITHUB_TOKEN")
    repo_name = os.environ.get("GITHUB_REPO")
    main_branch = os.environ.get("MAIN_BRANCH", "main")
    release_branch = os.environ.get("RELEASE_BRANCH", "release")
    
    if not token or not repo_name:
        print("Error: GITHUB_TOKEN and GITHUB_REPO environment variables must be set.")
        print("Example usage:")
        print("  GITHUB_TOKEN=your_token GITHUB_REPO=owner/repo python github_branch_analyzer.py")
        return
    
    # Create analyzer and run analysis
    analyzer = GitHubBranchAnalyzer(token, repo_name, main_branch, release_branch)
    analyzer.save_results(args.date, args.output)

if __name__ == "__main__":
    main()
