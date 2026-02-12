#!/usr/bin/env node
/**
 * Generate Index - Orchestrates all generation scripts
 */
const { execSync } = require('child_process');

console.log('Starting full site generation...\n');

const scripts = [
  'aggregate-api.js',
  'generate-categories.js',
  'generate-stats.js',
  'generate-pages.js'
];

for (const script of scripts) {
  console.log(`Running ${script}...`);
  try {
    execSync(`node ${__dirname}/${script}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed: ${script}`);
    process.exit(1);
  }
  console.log();
}

console.log('✅ All generation complete!');
