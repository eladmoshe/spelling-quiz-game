#!/usr/bin/env node

/**
 * Simple script to fix GitHub Pages deployment issues
 * This script:
 * 1. Creates the .nojekyll file
 * 2. Adds a base tag to index.html
 * 3. Fixes asset paths in index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const distDir = path.join(rootDir, 'dist');
const BASE_URL = '/spelling-quiz-game/';

console.log('🛠️ Fixing GitHub Pages deployment issues...');

// Create .nojekyll file
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('✅ Created .nojekyll file');

// Fix index.html
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Make sure we have a base tag
  if (!content.includes('<base href=')) {
    content = content.replace('<head>', '<head>\n    <base href="' + BASE_URL + '">');
    console.log('✅ Added base tag');
  }
  
  // Fix script paths - convert absolute paths with /spelling-quiz-game/ to relative paths
  content = content.replace(/src="\/spelling-quiz-game\/assets\//g, 'src="assets/');
  
  // Fix link paths
  content = content.replace(/href="\/spelling-quiz-game\/assets\//g, 'href="assets/');
  
  // Add type attribute to speech SDK
  if (content.includes('microsoft-cognitiveservices-speech-sdk') && 
      !content.includes('type="text/javascript" src="https://unpkg.com/microsoft-cognitiveservices-speech-sdk')) {
    content = content.replace(
      /<script\s+src="https:\/\/unpkg\.com\/microsoft-cognitiveservices-speech-sdk/,
      '<script type="text/javascript" src="https://unpkg.com/microsoft-cognitiveservices-speech-sdk'
    );
    console.log('✅ Fixed script type attribute');
  }
  
  fs.writeFileSync(indexPath, content);
  console.log('✅ Fixed asset paths in index.html');
} else {
  console.error('❌ index.html not found in dist directory');
}

console.log('✅ GitHub Pages deployment fixes completed!');
