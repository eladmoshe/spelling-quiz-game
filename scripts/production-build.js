#!/usr/bin/env node

/**
 * This script performs a complete production build with validation.
 * It will fail the build if there are any issues that would break the app in production.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.blue('\n🏗️  Running production build with validation\n'));

// Ensure the build is done in production mode
process.env.NODE_ENV = 'production';

try {
  // Step 1: Clean any previous build
  console.log(chalk.gray('Cleaning previous build...'));
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Step 2: Perform TypeScript type checking
  console.log(chalk.gray('\nRunning TypeScript type checking...'));
  execSync('tsc --noEmit', { stdio: 'inherit' });
  console.log(chalk.green('✅ TypeScript type checking passed!'));
  
  // Step 3: Build the application
  console.log(chalk.gray('\nBuilding the application...'));
  execSync('npm run build', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });
  console.log(chalk.green('✅ Build completed!'));
  
  // Step 4: Apply build fixes
  console.log(chalk.gray('\nApplying build fixes...'));
  execSync('node scripts/fixes/fix-build.js', { stdio: 'inherit' });
  console.log(chalk.green('✅ Build fixes applied!'));
  
  // Step 5: Validate the build
  console.log(chalk.gray('\nValidating the build...'));
  execSync('node scripts/validate-build.js', { stdio: 'inherit' });
  console.log(chalk.green('✅ Build validation passed!'));
  
  // Step 6: Simulate deployment (optional)
  console.log(chalk.gray('\nSimulating deployment (this requires puppeteer to be installed)...'));
  try {
    execSync('node scripts/simulate-deployment.js', { stdio: 'inherit' });
    console.log(chalk.green('✅ Deployment simulation passed!'));
  } catch (err) {
    console.log(chalk.yellow('⚠️ Deployment simulation skipped or failed. Install puppeteer with:'));
    console.log(chalk.yellow('   npm install --save-dev puppeteer'));
    console.log(chalk.yellow('   Or run the simulation manually with: node scripts/simulate-deployment.js'));
  }
  
  console.log(chalk.green('\n✅ Production build completed successfully!'));
  console.log(chalk.green('   The build should work correctly when deployed to GitHub Pages.'));
  
} catch (error) {
  console.error(chalk.red('\n❌ Production build failed!'));
  console.error(chalk.red(error.message));
  process.exit(1);
}
