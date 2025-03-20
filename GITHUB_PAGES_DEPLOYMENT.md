# GitHub Pages Deployment Guide

This document provides guidance on deploying the Spelling Quiz Game to GitHub Pages and resolving common deployment issues.

## Automatic Deployment

The project is set up with a GitHub Actions workflow that automatically builds and deploys the application to GitHub Pages when changes are pushed to the main branch.

### How It Works

1. The workflow is defined in `.github/workflows/build-and-deploy.yml`
2. It builds the project using `npm run build`
3. Applies necessary fixes for GitHub Pages with `scripts/deploy-fix/fix-github-pages.js`
4. Deploys the `dist` directory to GitHub Pages

## Common Deployment Issues

The build validation process may identify several issues that would break the application on GitHub Pages:

### 1. Absolute Path References

GitHub Pages hosts the site at a subdirectory (e.g., `/spelling-quiz-game/`), which means absolute paths like `/assets/main.js` break.

**Solution**: 
- Use relative paths (`assets/main.js`) or ensure paths include the base URL
- A `<base href="/spelling-quiz-game/">` tag helps resolve relative URLs correctly

### 2. Missing .nojekyll File

GitHub Pages uses Jekyll by default, which ignores files starting with underscore (`_`). This can cause problems with some JavaScript files.

**Solution**:
- Add a `.nojekyll` file in the root of the published directory
- This is handled automatically by the deployment script

### 3. Script Tag Issues

Certain scripts may need explicit type attributes.

**Solution**:
- Add appropriate type attributes to script tags
- Example: `<script type="text/javascript">` or `<script type="module">`

## Manual Deployment

If you need to manually prepare a build for deployment:

1. Run the pre-deployment script:
   ```bash
   chmod +x scripts/pre-deploy.sh
   ./scripts/pre-deploy.sh
   ```

2. Or use the npm script:
   ```bash
   npm run build:gh-pages
   ```

3. Then validate the build:
   ```bash
   npm run validate
   ```

## Troubleshooting

If you encounter deployment issues:

1. Check the build validation output:
   ```bash
   npm run build
   npm run validate
   ```

2. Apply fixes manually:
   ```bash
   npm run deploy:fix
   ```

3. Simulate GitHub Pages constraints:
   ```bash
   npm run simulate
   ```

## More Information

For more details on GitHub Pages deployment:
1. [GitHub Pages Documentation](https://docs.github.com/en/pages)
2. [Vite's Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
