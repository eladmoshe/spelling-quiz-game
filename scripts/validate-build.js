#!/usr/bin/env node

/**
 * This script validates the build output to ensure it will work correctly when deployed
 * to GitHub Pages or other production environments.
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BUILD_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = '/spelling-quiz-game/';
const CRITICAL_ERRORS = [];
const WARNINGS = [];

console.log(chalk.blue('\n🔍 Validating build output for production deployment...\n'));

// Check if the build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  CRITICAL_ERRORS.push(`Build directory ${BUILD_DIR} does not exist. Run "npm run build" first.`);
  outputResults();
  process.exit(1);
}

// Find all HTML files
const htmlFiles = globSync(`${BUILD_DIR}/**/*.html`);
if (htmlFiles.length === 0) {
  CRITICAL_ERRORS.push('No HTML files found in the build directory.');
  outputResults();
  process.exit(1);
}

console.log(chalk.gray(`Found ${htmlFiles.length} HTML files to validate.`));

// Check HTML files for common issues
htmlFiles.forEach(file => {
  const relativePath = path.relative(BUILD_DIR, file);
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for TypeScript references in script tags
  const tsScriptMatches = content.match(/<script[^>]*src=["']([^"']*\.ts)["'][^>]*>/g);
  if (tsScriptMatches) {
    CRITICAL_ERRORS.push(`${relativePath}: Contains direct TypeScript references which won't work in production:`);
    tsScriptMatches.forEach(match => {
      CRITICAL_ERRORS.push(`  - ${match}`);
    });
  }
  
  // Check for script modules without type="module"
  const moduleScripts = content.match(/<script[^>]*src=["'][^"']*\.[jt]s["'][^>]*>/g) || [];
  moduleScripts.forEach(script => {
    if (!script.includes('type="module"') && !script.includes("type='module'")) {
      WARNINGS.push(`${relativePath}: Script tag without type="module" might cause issues if it's an ES module:`);
      WARNINGS.push(`  - ${script}`);
    }
  });
  
  // Check for absolute paths that might break in GitHub Pages
  const absolutePathMatches = content.match(/src=["']\/(?!${BASE_URL.replace(/\//g, '\\/')})[^"']*["']/g);
  if (absolutePathMatches) {
    CRITICAL_ERRORS.push(`${relativePath}: Contains absolute paths that will break on GitHub Pages:`);
    absolutePathMatches.forEach(match => {
      CRITICAL_ERRORS.push(`  - ${match}`);
    });
  }
  
  // Check for base tag correctness
  if (relativePath === 'index.html') {
    const baseTagMatch = content.match(/<base[^>]*href=["']([^"']*)["'][^>]*>/);
    if (!baseTagMatch) {
      WARNINGS.push(`${relativePath}: No <base> tag found. This may cause path resolution issues.`);
    } else if (process.env.NODE_ENV === 'production' && !baseTagMatch[1].includes(BASE_URL)) {
      CRITICAL_ERRORS.push(`${relativePath}: <base> tag doesn't use the correct production URL (${BASE_URL}):`);
      CRITICAL_ERRORS.push(`  - ${baseTagMatch[0]}`);
    }
  }
});

// Check for .nojekyll file in the build directory
if (!fs.existsSync(path.join(BUILD_DIR, '.nojekyll'))) {
  CRITICAL_ERRORS.push('.nojekyll file is missing in the build directory. This is required for GitHub Pages.');
}

// Check JavaScript files for import statements that might break
const jsFiles = globSync(`${BUILD_DIR}/**/*.js`);
console.log(chalk.gray(`Found ${jsFiles.length} JavaScript files to validate.`));

jsFiles.forEach(file => {
  const relativePath = path.relative(BUILD_DIR, file);
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for imports of .ts files
  const tsImportMatches = content.match(/import.+from\s+['"]([^'"]*\.ts)['"];?/g);
  if (tsImportMatches) {
    CRITICAL_ERRORS.push(`${relativePath}: Contains imports of TypeScript files that won't work in production:`);
    tsImportMatches.forEach(match => {
      CRITICAL_ERRORS.push(`  - ${match}`);
    });
  }
});

// Output the results
function outputResults() {
  if (CRITICAL_ERRORS.length > 0) {
    console.log(chalk.red(`\n❌ ${CRITICAL_ERRORS.length} critical errors found that will break in production:`));
    CRITICAL_ERRORS.forEach(error => {
      console.log(chalk.red(`  - ${error}`));
    });
  }
  
  if (WARNINGS.length > 0) {
    console.log(chalk.yellow(`\n⚠️ ${WARNINGS.length} potential issues found:`));
    WARNINGS.forEach(warning => {
      console.log(chalk.yellow(`  - ${warning}`));
    });
  }
  
  if (CRITICAL_ERRORS.length === 0 && WARNINGS.length === 0) {
    console.log(chalk.green('\n✅ Build validation passed! No issues found.'));
  } else if (CRITICAL_ERRORS.length === 0) {
    console.log(chalk.yellow('\n⚠️ Build validation passed with warnings. Review them before deploying.'));
  } else {
    console.log(chalk.red('\n❌ Build validation failed! Fix the critical errors before deploying.'));
  }
}

outputResults();

// Exit with error code if there are critical errors
if (CRITICAL_ERRORS.length > 0) {
  process.exit(1);
}
