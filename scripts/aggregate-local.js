#!/usr/bin/env node
/**
 * Aggregate Local - Aggregates api.json files from local phenomenon directories
 * Use this for local development when GitHub API is not available
 */
const fs = require('fs').promises;
const path = require('path');

const PARENT_DIR = path.join(__dirname, '../../');
const OUTPUT_DIR = path.join(__dirname, '../api/v1');

const EXCLUDED_DIRS = [
  'wyrdness.github.io',
  '.github',
  '.git',
  'node_modules'
];

// Flatten nested api.json structure for easier consumption
function flattenPhenomenon(data) {
  const p = data.phenomenon || {};
  const dist = data.distribution || {};
  const range = dist.range || {};
  const temporal = dist.temporal || {};
  const firstRecorded = temporal.first_recorded || {};

  return {
    id: p.id || data.id,
    name: p.name || data.name,
    category: (p.category || data.category || 'uncategorized').toLowerCase(),
    description: (p.description && p.description.summary) || p.description || data.description || '',
    aliases: p.aliases || data.aliases || [],
    tags: p.tags || data.tags || [],
    status: p.status || data.status || 'unknown',
    regions: range.regions || range.countries || data.regions || [],
    origin: range.description || data.origin || '',
    first_reported: firstRecorded.date || data.first_reported || 'Unknown',
    danger_level: data.danger_level || 'unknown',
    evidence_level: data.evidence_level || 'unknown'
  };
}

async function main() {
  console.log('Starting local API aggregation...');

  // Get all directories in parent
  const entries = await fs.readdir(PARENT_DIR, { withFileTypes: true });
  const phenomenonDirs = entries
    .filter(e => e.isDirectory() && !EXCLUDED_DIRS.includes(e.name) && !e.name.startsWith('.'))
    .map(e => e.name);

  console.log(`Found ${phenomenonDirs.length} phenomenon directories`);

  const allData = [];
  let successCount = 0;
  let errorCount = 0;

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const dirName of phenomenonDirs) {
    const apiPath = path.join(PARENT_DIR, dirName, 'api.json');
    try {
      const content = await fs.readFile(apiPath, 'utf8');
      const rawData = JSON.parse(content);
      const flatData = flattenPhenomenon(rawData);

      // Save individual file (flattened)
      await fs.writeFile(
        path.join(OUTPUT_DIR, `${dirName}.json`),
        JSON.stringify(flatData, null, 2)
      );

      allData.push(flatData);
      successCount++;
      if (successCount % 50 === 0) console.log(`  ${successCount} processed...`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`✗ ${dirName}: ${error.message}`);
      }
      errorCount++;
    }
  }

  // Save index file
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify({
      version: '1.0.0',
      generated: new Date().toISOString(),
      total: allData.length,
      phenomena: allData
    }, null, 2)
  );

  console.log(`\nAggregation complete!`);
  console.log(`Success: ${successCount}, Errors: ${errorCount}`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
