# GitHub Branch Analyzer with Date Filtering

A tool to compare branches in GitHub repositories at specific points in time, visualizing which feature branches were merged into main and release branches.

## Features

- **Date-Based Analysis**: Compare branches as they existed on any specific date
- **Interactive Visualization**: See branch relationships through an interactive Venn diagram
- **Timeline View**: Track how branches evolved over time with a visual timeline
- **Branch Details**: Get detailed information about each merged branch
- **Search & Filter**: Easily find specific branches across your repository
- **History Navigation**: Jump between different analysis dates to see changes
- **GitHub Pages Deployment**: Automatically deploy to GitHub Pages using GitHub Actions

## Repository Structure

```
.
├── .github/workflows/       # GitHub Actions workflow files
│   └── branch-analysis.yml  # Workflow for branch analysis and deployment
├── _config.yml              # GitHub Pages configuration
├── github_branch_analyzer_for_actions.py  # Script to analyze GitHub branches
├── analyze_branch_data_for_actions.py     # Script to process branch data
├── visualization/           # Web visualization files (copied during deployment)
├── DEPLOYMENT_GUIDE.md      # Guide for deploying to GitHub Pages
└── README.md                # This file
```

## Quick Start

1. **Fork or clone this repository**

2. **Create a GitHub Personal Access Token**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Create a token with `repo` permissions

3. **Add the token as a repository secret**
   - Go to your repository → Settings → Secrets → Actions
   - Add a secret named `GH_PAT` with your token as the value

4. **Configure GitHub Pages**
   - Go to your repository → Settings → Pages
   - Set source to "GitHub Actions"

5. **Trigger the workflow**
   - Go to Actions → "Branch Comparison Analysis and Deployment" → Run workflow

6. **Access your visualization**
   - Once the workflow completes, your visualization will be available at:
   - `https://[your-username].github.io/[repository-name]/`

## Configuration

You can customize the analysis by editing the workflow file:

- Change the branches to analyze (default: main and release)
- Modify the analysis schedule (default: daily at midnight)
- Adjust the number of historical dates to analyze

## Local Development

To run the analysis locally:

```bash
# Install dependencies
pip install PyGithub

# Run the analysis
export GITHUB_TOKEN=your_token
export GITHUB_REPO=owner/repo
python github_branch_analyzer_for_actions.py
python analyze_branch_data_for_actions.py
```

## Documentation

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## License

MIT

## Acknowledgements

This tool was created to help development teams better understand their branch merging patterns and improve their release processes.
