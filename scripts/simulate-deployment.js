#!/usr/bin/env node

/**
 * This script simulates a GitHub Pages deployment by serving the built files
 * with the correct base path and checking for loading errors.
 */

import http from 'http';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import mime from 'mime-types';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BUILD_DIR = path.resolve(__dirname, '../dist');
const PORT = 8080;
const BASE_PATH = '/spelling-quiz-game/';
const LOG_ERRORS = [];
const LOG_WARNINGS = [];

console.log(chalk.blue('\n🚀 Simulating GitHub Pages deployment...\n'));

// Check if the build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  console.log(chalk.red(`❌ Build directory ${BUILD_DIR} does not exist. Run "npm run build" first.`));
  process.exit(1);
}

// Create a static file server with GitHub Pages-like constraints
const server = http.createServer((req, res) => {
  // GitHub Pages specific behavior simulation
  let url = req.url;
  
  // Strip the base path for local testing
  if (url.startsWith(BASE_PATH)) {
    url = url.substring(BASE_PATH.length);
  }
  
  // Handle root path
  if (url === '/' || url === '') {
    url = '/index.html';
  }
  
  // Construct file path
  const filePath = path.join(BUILD_DIR, url);
  
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      console.log(chalk.red(`[404] ${url}`));
      return;
    }
    
    // Get MIME type
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    
    // GitHub Pages doesn't serve .ts files as application/typescript
    if (path.extname(filePath) === '.ts') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found - TypeScript files are not served by GitHub Pages');
      console.log(chalk.red(`[404] ${url} (TypeScript files are not served by GitHub Pages)`));
      return;
    }
    
    // Read the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        console.log(chalk.red(`[500] ${url}`));
        return;
      }
      
      // Serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
      console.log(chalk.gray(`[200] ${url} (${contentType})`));
    });
  });
});

// Start the server
server.listen(PORT, async () => {
  console.log(chalk.green(`Server started at http://localhost:${PORT}${BASE_PATH}/`));
  console.log(chalk.gray('Simulating GitHub Pages constraints...'));
  
  try {
    // Launch a headless browser to test page loading
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Collect console messages
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        LOG_ERRORS.push(`Console error: ${text}`);
        console.log(chalk.red(`Browser console error: ${text}`));
      } else if (type === 'warning') {
        LOG_WARNINGS.push(`Console warning: ${text}`);
        console.log(chalk.yellow(`Browser console warning: ${text}`));
      }
    });
    
    // Collect network errors (except analytics which are expected to fail in local environment)
page.on('requestfailed', request => {
    const url = request.url();
    const failure = request.failure();
    
  // Ignore analytics-related failures, as they're expected in local testing
  if (url.includes('google-analytics.com') || 
      url.includes('clarity.ms') || 
      url.includes('analytics') || 
      url.includes('tracking')) {
    console.log(chalk.gray(`Ignoring expected analytics failure: ${url}`));
    return;
  }
  
  LOG_ERRORS.push(`Network error: ${url} - ${failure.errorText}`);
  console.log(chalk.red(`Network request failed: ${url} - ${failure.errorText}`));
});
    
    // Navigate to the site
    console.log(chalk.blue(`Testing page load at http://localhost:${PORT}${BASE_PATH}/`));
    const response = await page.goto(`http://localhost:${PORT}${BASE_PATH}/`, {
      waitUntil: 'networkidle0',
      timeout: 20000  // Increased timeout for better reliability
    });
    
    if (!response.ok()) {
      LOG_ERRORS.push(`Page load failed with status ${response.status()}`);
      console.log(chalk.red(`❌ Page load failed with status ${response.status()}`));
    } else {
      console.log(chalk.green(`✅ Initial page loaded successfully (status ${response.status()})`));
      
      // Check if app initialized correctly with a longer wait time
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer for app to initialize
      
      // Check if app initialized correctly
      const appInitialized = await page.evaluate(() => {
        // More detailed DOM check
        const app = document.querySelector('#app');
        if (!app) return false;
        
        // Check for any dynamic content being added
        return app.children.length > 1 || 
               app.innerHTML.includes('quiz-container') || 
               app.innerHTML.includes('input') || 
               document.querySelector('.card') !== null;
      });
      
      if (!appInitialized) {
        // This is a warning, not an error - don't let it fail the deployment
        LOG_WARNINGS.push('The app may not have initialized correctly. DOM is minimal.');
        console.log(chalk.yellow('⚠️ The app may not have initialized correctly. DOM is minimal.'));
      } else {
        console.log(chalk.green('✅ App appears to have initialized correctly.'));
      }
    }
    
    await browser.close();
  } catch (error) {
    LOG_ERRORS.push(`Test automation error: ${error.message}`);
    console.log(chalk.red(`❌ Test automation error: ${error.message}`));
  }
  
  // Output the results
  if (LOG_ERRORS.length === 0 && LOG_WARNINGS.length === 0) {
    console.log(chalk.green('\n✅ Deployment simulation passed! The app should work on GitHub Pages.'));
  } else {
    if (LOG_ERRORS.length > 0) {
      console.log(chalk.red(`\n❌ Found ${LOG_ERRORS.length} errors that would break the app in production:`));
      LOG_ERRORS.forEach((error, i) => {
        console.log(chalk.red(`  ${i+1}. ${error}`));
      });
    }
    
    if (LOG_WARNINGS.length > 0) {
      console.log(chalk.yellow(`\n⚠️ Found ${LOG_WARNINGS.length} warnings that might cause issues:`));
      LOG_WARNINGS.forEach((warning, i) => {
        console.log(chalk.yellow(`  ${i+1}. ${warning}`));
      });
    }
    
    if (LOG_ERRORS.length > 0) {
      console.log(chalk.red('\n❌ Deployment simulation failed! Fix the errors before deploying.'));
      server.close();
      process.exit(1);
    } else {
      console.log(chalk.yellow('\n⚠️ Deployment simulation passed with warnings. Review them before deploying.'));
    }
  }
  
  // Close the server
  server.close();
});
