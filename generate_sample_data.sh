#!/bin/bash

# Example data generator for GitHub Branch Analyzer
# This script creates sample data for demonstration purposes

echo "Generating sample branch data for demonstration..."

# Create sample data that matches the format of the real analyzer output
cat > branch_data.json << EOF
{
  "main": [
    "feature/profile-789",
    "feature/payment-456",
    "feature/auth-123"
  ],
  "release": [
    "feature/notification-202",
    "feature/search-101",
    "feature/auth-123"
  ],
  "common": [
    "feature/auth-123"
  ],
  "mainOnly": [
    "feature/profile-789",
    "feature/payment-456"
  ],
  "releaseOnly": [
    "feature/notification-202",
    "feature/search-101"
  ],
  "timestamp": "$(date -Iseconds)",
  "repository": "example/private-repo"
}
EOF

echo "Sample data generated in branch_data.json"
echo "This file can be used for testing the visualization website."
echo "For real data, you'll need to run the analyzer with your GitHub credentials."
