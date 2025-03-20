#!/bin/bash

# Make scripts executable
chmod +x scripts/validate-build.js
chmod +x scripts/simulate-deployment.js
chmod +x scripts/production-build.js
chmod +x scripts/test-simulation.js
chmod +x scripts/fixes/fix-build.js
chmod +x scripts/deploy-fix/fix-github-pages.js
chmod +x scripts/pre-deploy.sh

echo "Scripts are now executable."
