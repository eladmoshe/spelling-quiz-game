#!/usr/bin/env node

/**
 * Simple post-build script to fix GitHub Pages deployment issues
 * This runs immediately after Vite builds the site
 */

import fs from 'fs';
import path from 'path';

const distDir = path.resolve('./dist');
console.log(`📝 Post-build: Running fixes on ${distDir}`);

// 1. Create .nojekyll file
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('✅ Created .nojekyll file');

// 2. Fix index.html
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Replace the dynamic base script with a static base tag
  if (content.includes('document.createElement("base")')) {
    content = content.replace(
      /<script>[\s\S]*?document\.head\.insertBefore\(base[\s\S]*?<\/script>/,
      '<base href="/spelling-quiz-game/">'
    );
    console.log('✅ Added static base tag');
  }
  
  // Fix asset paths - convert /spelling-quiz-game/assets/ to assets/
  if (content.includes('"/spelling-quiz-game/assets/')) {
    content = content.replace(/src="\/spelling-quiz-game\/assets\//g, 'src="assets/');
    content = content.replace(/href="\/spelling-quiz-game\/assets\//g, 'href="assets/');
    console.log('✅ Fixed asset paths');
  }
  
  // Add type to Microsoft speech SDK
  if (content.includes('microsoft-cognitiveservices-speech-sdk') && 
      !content.includes('type="text/javascript"')) {
    content = content.replace(
      /<script\s+src="https:\/\/unpkg\.com\/microsoft-cognitiveservices-speech-sdk/,
      '<script type="text/javascript" src="https://unpkg.com/microsoft-cognitiveservices-speech-sdk'
    );
    console.log('✅ Added type to speech SDK script');
  }
  
  fs.writeFileSync(indexPath, content);
  console.log('✅ Updated index.html');
} else {
  console.error('❌ index.html not found in dist directory');
}

console.log('✅ Post-build fixes completed successfully!');
