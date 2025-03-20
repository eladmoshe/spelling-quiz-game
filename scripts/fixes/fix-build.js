#!/usr/bin/env node

/**
 * This script fixes common build issues for GitHub Pages deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BUILD_DIR = path.resolve(__dirname, '../../dist');
const BASE_URL = '/spelling-quiz-game/';

console.log('🔧 Fixing build issues for GitHub Pages deployment...');

// Create .nojekyll file
const nojekyllPath = path.join(BUILD_DIR, '.nojekyll');
fs.writeFileSync(nojekyllPath, '');
console.log('✅ Created .nojekyll file');

// Fix index.html
const indexPath = path.join(BUILD_DIR, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Add explicit <base> tag instead of dynamically creating it
indexContent = indexContent.replace(
  /<script>\s*\(function \(\) \{\s*var baseHref[\s\S]*?}\)\(\);\s*<\/script>/,
  `<base href="${BASE_URL}">`
);

// Ensure Microsoft speech SDK has type="text/javascript"
indexContent = indexContent.replace(
  /<script\s+src="https:\/\/unpkg\.com\/microsoft-cognitiveservices-speech-sdk[^>]*>/,
  '<script type="text/javascript" src="https://unpkg.com/microsoft-cognitiveservices-speech-sdk@1.42.0/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js">'
);

// Fix absolute paths for script and link tags with "/spelling-quiz-game/" prefix
indexContent = indexContent.replace(
  /src="\/spelling-quiz-game\/assets\/([^"]+)"/g, 
  'src="assets/$1"'
);

indexContent = indexContent.replace(
  /href="\/spelling-quiz-game\/assets\/([^"]+)"/g, 
  'href="assets/$1"'
);

// Ensure analytics scripts have environment checks
if (!indexContent.includes('location.hostname !== "localhost"')) {
  // Add environment check for Google Analytics
  indexContent = indexContent.replace(
    /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^>]*><\/script>\s*<script>/,
    '<script>\n  if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {\n    const gaScript = document.createElement("script");\n    gaScript.async = true;\n    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-JDYT47RXP1";\n    document.head.appendChild(gaScript);\n  }\n</script>\n<script>'
  );
  
  // Add environment check for Clarity
  indexContent = indexContent.replace(
    /\(function\(c,l,a,r,i,t,y\)\{/,
    'if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {\n    (function(c,l,a,r,i,t,y){'
  );
  
  indexContent = indexContent.replace(
    /}\)\(window, document, "clarity", "script", "[^"]+"\);/,
    '})(window, document, "clarity", "script", "qcyse1fkca");\n  }'
  );
}

fs.writeFileSync(indexPath, indexContent);
console.log('✅ Fixed index.html');

// Fix other HTML files if needed
const otherHtmlFiles = fs.readdirSync(BUILD_DIR)
  .filter(file => file.endsWith('.html') && file !== 'index.html')
  .map(file => path.join(BUILD_DIR, file));

for (const htmlFile of otherHtmlFiles) {
  let htmlContent = fs.readFileSync(htmlFile, 'utf8');
  
  // Apply the same path fixes
  htmlContent = htmlContent.replace(
    /src="\/spelling-quiz-game\/assets\/([^"]+)"/g, 
    'src="assets/$1"'
  );
  
  htmlContent = htmlContent.replace(
    /href="\/spelling-quiz-game\/assets\/([^"]+)"/g, 
    'href="assets/$1"'
  );
  
  fs.writeFileSync(htmlFile, htmlContent);
  console.log(`✅ Fixed ${path.basename(htmlFile)}`);
}

console.log('🎉 Build fixes completed successfully!');
