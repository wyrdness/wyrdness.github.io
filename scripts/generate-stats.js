#!/usr/bin/env node
/**
 * Generate Stats - Creates statistics metadata
 */
const fs = require('fs').promises;
const path = require('path');

const API_DIR = path.join(__dirname, '../api/v1');

async function main() {
  console.log('Generating stats...');

  const indexData = JSON.parse(
    await fs.readFile(path.join(API_DIR, 'index.json'), 'utf8')
  );

  const stats = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    total_phenomena: indexData.total,
    by_category: {},
    by_region: {},
    by_danger_level: {},
    by_evidence_level: {}
  };

  indexData.phenomena.forEach(item => {
    // Categories
    const cat = item.category || 'uncategorized';
    stats.by_category[cat] = (stats.by_category[cat] || 0) + 1;

    // Regions
    (item.regions || []).forEach(region => {
      stats.by_region[region] = (stats.by_region[region] || 0) + 1;
    });

    // Danger
    if (item.danger_level) {
      stats.by_danger_level[item.danger_level] = 
        (stats.by_danger_level[item.danger_level] || 0) + 1;
    }

    // Evidence
    if (item.evidence_level) {
      stats.by_evidence_level[item.evidence_level] = 
        (stats.by_evidence_level[item.evidence_level] || 0) + 1;
    }
  });

  await fs.writeFile(
    path.join(API_DIR, 'stats.json'),
    JSON.stringify(stats, null, 2)
  );

  console.log('✓ Stats generated');
}

main().catch(console.error);
