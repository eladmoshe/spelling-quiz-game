#!/bin/bash

# This script prepares the project for deployment to GitHub Pages
# It builds the project, applies fixes, and validates the build

echo "🚀 Preparing for GitHub Pages deployment..."

# Set production environment
export NODE_ENV=production

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the project 
echo "🔨 Building the project..."
npm run build

# Apply GitHub Pages fixes
echo "🛠️  Applying GitHub Pages fixes..."
node scripts/deploy-fix/fix-github-pages.js

# Create .nojekyll file (extra precaution)
echo "📄 Creating .nojekyll file..."
touch dist/.nojekyll

# Validate the build
echo "🔍 Validating the build..."
node scripts/validate-build.js

if [ $? -eq 0 ]; then
  echo "✅ Build is ready for GitHub Pages deployment!"
  echo "   You can now commit and push to deploy."
else
  echo "❌ Build validation failed. Please fix the issues before deploying."
  exit 1
fi
