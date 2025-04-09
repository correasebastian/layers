# GitHub Branch Analyzer - Deployment Guide

This guide explains how to deploy the GitHub Branch Analyzer with date filtering to GitHub Pages using GitHub Actions.

## Overview

This deployment method will:
1. Automatically run branch analysis on a schedule (daily by default)
2. Generate visualizations for multiple dates
3. Deploy the results to GitHub Pages
4. Make the visualization accessible via a public URL

## Prerequisites

- A GitHub repository where you want to deploy the visualization
- Admin access to the repository to configure GitHub Pages and secrets
- A GitHub Personal Access Token (PAT) with appropriate permissions

## Step 1: Set Up Your Repository

1. Create a new repository or use an existing one
2. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/your-repository.git
   cd your-repository
   ```

3. Copy all the files from the GitHub Branch Analyzer into your repository:
   - `.github/workflows/branch-analysis.yml`
   - `_config.yml`
   - `github_branch_analyzer_for_actions.py`
   - `analyze_branch_data_for_actions.py`
   - All files from the `git-branch-comparison-website` directory

## Step 2: Create a Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Give it a name like "Branch Analyzer Deployment"
4. Set the expiration as needed (e.g., 1 year)
5. Select the repository you want to analyze
6. Under "Repository permissions", grant:
   - Contents: Read and write
   - Pull requests: Read
   - Metadata: Read
   - Pages: Read and write
7. Click "Generate token" and copy the token value

## Step 3: Configure Repository Secrets

1. Go to your repository on GitHub
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add a secret with name `GH_PAT` and paste your Personal Access Token as the value
5. Click "Add secret"

## Step 4: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" → "Pages"
3. Under "Source", select "GitHub Actions" as the build and deployment source
4. This will allow the workflow to handle the deployment

## Step 5: Customize the Workflow (Optional)

You can customize the workflow by editing `.github/workflows/branch-analysis.yml`:

1. Change the schedule:
   ```yaml
   schedule:
     - cron: '0 0 * * *'  # Default: Run daily at midnight
   ```

2. Modify the branches to analyze:
   ```yaml
   env:
     MAIN_BRANCH: main      # Change to your main branch name
     RELEASE_BRANCH: release # Change to your release branch name
   ```

3. Adjust the number of historical dates:
   ```yaml
   # Run analysis for past 7 days
   for i in {1..7}; do      # Change 7 to your desired number of days
   ```

## Step 6: Push Changes and Trigger the Workflow

1. Commit and push all changes to your repository:
   ```bash
   git add .
   git commit -m "Add GitHub Branch Analyzer with GitHub Actions deployment"
   git push
   ```

2. This will automatically trigger the workflow for the first time

3. You can also manually trigger the workflow:
   - Go to your repository on GitHub
   - Click on "Actions"
   - Select the "Branch Comparison Analysis and Deployment" workflow
   - Click "Run workflow"

## Step 7: Access Your Deployed Visualization

1. After the workflow completes successfully:
   - Go to your repository on GitHub
   - Click on "Settings" → "Pages"
   - You'll see a message like "Your site is published at https://yourusername.github.io/your-repository/"

2. Visit the URL to access your branch comparison visualization

3. The visualization will be automatically updated according to your workflow schedule

## Troubleshooting

### Workflow Failures

If the workflow fails:
1. Go to "Actions" in your repository
2. Click on the failed workflow run
3. Examine the logs to identify the issue

Common issues include:
- Invalid Personal Access Token
- Insufficient permissions
- Repository not found
- Branch names don't exist in your repository

### GitHub Pages Not Deploying

If GitHub Pages doesn't deploy:
1. Verify that GitHub Pages is enabled for your repository
2. Check that the workflow has the correct permissions
3. Ensure the `gh-pages` branch was created by the workflow

### Visualization Not Showing Data

If the visualization loads but doesn't show data:
1. Check that the analysis scripts ran successfully
2. Verify that JSON files were generated and copied to the visualization directory
3. Check browser console for JavaScript errors

## Advanced Configuration

### Custom Domain

To use a custom domain:
1. Go to "Settings" → "Pages"
2. Under "Custom domain", enter your domain
3. Update DNS settings as instructed

### Additional Analysis Dates

To analyze more historical dates:
1. Edit the workflow file
2. Modify the loop that generates historical dates
3. Consider performance implications for very large repositories

### Automatic Updates

The visualization will automatically update based on your workflow schedule. To change this:
1. Edit the `schedule` section in the workflow file
2. Use cron syntax to define your preferred schedule

## Conclusion

Your GitHub Branch Analyzer is now deployed to GitHub Pages and will automatically update according to your schedule. The visualization provides insights into your branch merging patterns over time, helping you understand your development workflow better.
