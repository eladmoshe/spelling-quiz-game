# GitHub Pages Deployment Guide

This document provides guidance on deploying the Spelling Quiz Game to GitHub Pages and resolving common deployment issues.

## Automatic Deployment

The project is set up with a GitHub Actions workflow that automatically builds and deploys the application to GitHub Pages when changes are pushed to the main branch.

### How It Works

1. The workflow is defined in `.github/workflows/build-and-deploy.yml`
2. It makes all scripts executable with `chmod +x` and `./scripts/make-executable.sh`
3. Builds the project using `npm run build` which:
   - Compiles TypeScript with `tsc`
   - Bundles with Vite
   - **Automatically applies GitHub Pages fixes with the post-build script**
4. Creates the `.nojekyll` file as a safety measure
5. Deploys the `dist` directory to GitHub Pages

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

1. Ensure scripts are executable:
   ```bash
   chmod +x scripts/make-executable.sh
   ./scripts/make-executable.sh
   ```

2. Build the project (fixes are automatically applied):
   ```bash
   npm run build
   ```

3. Validate the build:
   ```bash
   npm run validate
   ```

4. If needed, you can run additional fixes manually:
   ```bash
   npm run deploy:fix
   ```

## Troubleshooting

If you encounter deployment issues:

1. Make sure all scripts are executable:
   ```bash
   chmod +x scripts/post-build.js
   chmod +x scripts/make-executable.sh
   ./scripts/make-executable.sh
   ```

2. Check if the build process includes the post-build step:
   ```bash
   # The 'build' script in package.json should include post-build.js
   cat package.json | grep build
   ```

3. Manually run the post-build script if needed:
   ```bash
   node scripts/post-build.js
   ```

4. Validate the build and check for errors:
   ```bash
   npm run validate
   ```

5. Inspect the generated index.html for issues:
   ```bash
   cat dist/index.html | grep -B 1 -A 1 "spelling-quiz-game"
   ```

6. Verify the .nojekyll file exists:
   ```bash
   ls -la dist/.nojekyll
   ```

## More Information

For more details on GitHub Pages deployment:
1. [GitHub Pages Documentation](https://docs.github.com/en/pages)
2. [Vite's Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
