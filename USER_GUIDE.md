# GitHub Branch Analyzer - User Guide

This guide will walk you through the process of setting up and using the GitHub Branch Analyzer to visualize branch comparisons from your private GitHub repositories.

## Overview

The GitHub Branch Analyzer allows you to:
1. Connect to your private GitHub repositories using a Personal Access Token
2. Extract information about branches merged via pull requests
3. Compare branches (typically "main" and "release") to see which feature branches were merged where
4. Visualize the comparison with an interactive web interface

## Prerequisites

- A GitHub account with access to the private repository you want to analyze
- A Personal Access Token (PAT) with appropriate permissions
- Basic familiarity with command line operations

## Step 1: Set Up GitHub API Access

1. **Create a Personal Access Token (PAT)**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Click "Generate new token"
   - Give it a name like "Branch Comparison Tool"
   - Set the expiration as needed
   - Select the specific repository you want to analyze
   - Under "Repository permissions", grant at least "Read access" to:
     - Contents
     - Pull requests
     - Metadata
   - Click "Generate token"
   - **IMPORTANT**: Copy the generated token immediately and store it securely. You won't be able to see it again!

## Step 2: Configure the Branch Analyzer

1. **Run the configuration script**:
   ```bash
   cd /path/to/github-branch-analyzer
   ./configure.sh
   ```

2. **Enter the requested information**:
   - GitHub Personal Access Token (the one you created in Step 1)
   - Repository name in the format "owner/repo-name" (e.g., "myusername/myproject")
   - Main branch name (default is "main")
   - Release branch name (default is "release")

## Step 3: Run the Branch Analysis

1. **Execute the analysis script**:
   ```bash
   cd /path/to/github-branch-analyzer
   ./run.sh
   ```

2. **Review the analysis output**:
   - The script will display a summary of the analysis results
   - The complete results are saved to `analyzed_branch_data.json`

## Step 4: View the Visualization

You can view the branch comparison visualization in two ways:

### Option 1: Use the Deployed Website

Visit the permanently deployed visualization website at:
[https://jmocizgq.manus.space](https://jmocizgq.manus.space)

To use your own data with this website:
1. Copy your `analyzed_branch_data.json` file to the same directory as the website
2. Refresh the page to see your data

### Option 2: Run the Visualization Locally

1. **Copy the analysis results to the website directory**:
   ```bash
   cp /path/to/github-branch-analyzer/analyzed_branch_data.json /path/to/git-branch-comparison-website/
   ```

2. **Start a local web server**:
   ```bash
   cd /path/to/git-branch-comparison-website
   python -m http.server 8000
   ```

3. **Open the visualization in your browser**:
   - Navigate to `http://localhost:8000` in your web browser

## Understanding the Visualization

The visualization shows:
- **Blue Circle**: Branches merged into the main branch
- **Orange Circle**: Branches merged into the release branch
- **Overlap**: Branches that appear in both main and release

Interactive features:
- Hover over branches to see details
- Click on a branch to see more information
- Use the search box to find specific branches
- Use the checkboxes to filter which branches are displayed

## Automating the Process

To automate the branch analysis, you can:

1. **Create a cron job** to run the analysis periodically:
   ```bash
   # Example: Run analysis daily at 2 AM
   0 2 * * * cd /path/to/github-branch-analyzer && ./run.sh
   ```

2. **Set up a GitHub Action** to run the analysis on push events or on a schedule

## Troubleshooting

### Common Issues:

1. **Authentication Errors**:
   - Ensure your Personal Access Token has the correct permissions
   - Check that the token hasn't expired
   - Verify you're using the correct token

2. **Repository Not Found**:
   - Confirm the repository name is in the format "owner/repo-name"
   - Verify that your GitHub account has access to the repository

3. **No Data Displayed**:
   - Check that the analysis completed successfully
   - Verify that the JSON file was copied to the correct location
   - Ensure the JSON file has the expected format

4. **Visualization Not Loading**:
   - Check your browser console for JavaScript errors
   - Ensure all files (HTML, CSS, JS) are in the same directory
   - Try using a different browser

## Getting Help

If you encounter issues not covered in this guide, please:
1. Check the GitHub repository for updates or known issues
2. Contact the developer with specific error messages and steps to reproduce the problem

## Security Considerations

- Your GitHub Personal Access Token provides access to your repositories. Keep it secure!
- The token is stored in the `.env` file with restricted permissions (readable only by you)
- Consider using a token with the minimum necessary permissions and a short expiration time
- Regularly rotate your tokens for enhanced security
