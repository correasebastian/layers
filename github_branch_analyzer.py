import os
import json
from github import Github
from datetime import datetime

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
        
    def get_merged_branches(self, target_branch):
        """
        Get all branches that were merged into the target branch via pull requests.
        
        Args:
            target_branch (str): The target branch to check (e.g., "main" or "release")
            
        Returns:
            list: List of branch names that were merged into the target branch
        """
        print(f"Fetching pull requests merged into {target_branch}...")
        
        # Get all closed pull requests that were merged into the target branch
        pulls = self.repo.get_pulls(state='closed', base=target_branch)
        
        # Extract the source branch names from the merged pull requests
        merged_branches = []
        for pr in pulls:
            if pr.merged:
                # Extract the source branch name
                source_branch = pr.head.ref
                # Check if it matches the feature/xxx-123 pattern
                if source_branch.startswith("feature/"):
                    merged_branches.append(source_branch)
                    print(f"Found merged branch: {source_branch}")
        
        return merged_branches
    
    def analyze_branches(self):
        """
        Analyze branches and generate comparison data.
        
        Returns:
            dict: Branch comparison data
        """
        # Get branches merged into main
        main_branches = self.get_merged_branches(self.main_branch)
        
        # Get branches merged into release
        release_branches = self.get_merged_branches(self.release_branch)
        
        # Find common branches
        common_branches = list(set(main_branches) & set(release_branches))
        
        # Find branches only in main
        main_only = list(set(main_branches) - set(release_branches))
        
        # Find branches only in release
        release_only = list(set(release_branches) - set(main_branches))
        
        # Create result data structure
        result = {
            "main": main_branches,
            "release": release_branches,
            "common": common_branches,
            "mainOnly": main_only,
            "releaseOnly": release_only,
            "timestamp": datetime.now().isoformat(),
            "repository": self.repo_name
        }
        
        return result
    
    def save_results(self, output_file="branch_data.json"):
        """
        Analyze branches and save results to a JSON file.
        
        Args:
            output_file (str): Path to the output JSON file
            
        Returns:
            dict: Branch comparison data
        """
        result = self.analyze_branches()
        
        # Save to JSON file
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
            
        print(f"Results saved to {output_file}")
        return result

def main():
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
    analyzer.save_results()

if __name__ == "__main__":
    main()
