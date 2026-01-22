#!/usr/bin/env node
/**
 * Generate Pages - Creates static HTML pages from templates
 */
const fs = require('fs').promises;
const path = require('path');

const API_DIR = path.join(__dirname, '../api/v1');
const TEMPLATE_DIR = path.join(__dirname, '../templates');
const OUTPUT_DIR = path.join(__dirname, '../phenomena');

async function main() {
  console.log('Generating static pages...');

  // Read template
  const template = await fs.readFile(
    path.join(TEMPLATE_DIR, 'phenomenon.html'),
    'utf8'
  );

  // Read data
  const indexData = JSON.parse(
    await fs.readFile(path.join(API_DIR, 'index.json'), 'utf8')
  );

  let count = 0;

  for (const item of indexData.phenomena) {
    const html = template
      .replace(/{{ID}}/g, item.id)
      .replace(/{{NAME}}/g, item.name)
      .replace(/{{CATEGORY}}/g, item.category)
      .replace(/{{DESCRIPTION}}/g, item.description || '')
      .replace(/{{ORIGIN}}/g, item.origin || '')
      .replace(/{{REGIONS}}/g, (item.regions || []).join(', '))
      .replace(/{{FIRST_REPORTED}}/g, item.first_reported || 'Unknown')
      .replace(/{{DANGER_LEVEL}}/g, item.danger_level || 'unknown')
      .replace(/{{EVIDENCE_LEVEL}}/g, item.evidence_level || 'unknown');

    const outputPath = path.join(OUTPUT_DIR, item.id);
    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(path.join(outputPath, 'index.html'), html);
    
    count++;
    if (count % 50 === 0) console.log(`  ${count} pages generated...`);
  }

  console.log(`✓ Generated ${count} phenomenon pages`);
}

main().catch(console.error);
