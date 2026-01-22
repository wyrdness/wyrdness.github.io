#!/usr/bin/env node
/**
 * Generate Categories - Creates category metadata
 */
const fs = require('fs').promises;
const path = require('path');

const API_DIR = path.join(__dirname, '../api/v1');

async function main() {
  console.log('Generating categories...');

  // Read index
  const indexData = JSON.parse(
    await fs.readFile(path.join(API_DIR, 'index.json'), 'utf8')
  );

  const categories = {};

  indexData.phenomena.forEach(item => {
    const cat = item.category || 'uncategorized';
    
    if (!categories[cat]){
      categories[cat] = {
        name: cat,
        count: 0,
        phenomena: []
      };
    }

    categories[cat].count++;
    categories[cat].phenomena.push({
      id: item.id,
      name: item.name,
      regions: item.regions
    });
  });

  // Save categories
  await fs.writeFile(
    path.join(API_DIR, 'categories.json'),
    JSON.stringify({
      version: '1.0.0',
      generated: new Date().toISOString(),
      total: Object.keys(categories).length,
      categories: categories
    }, null, 2)
  );

  console.log(`✓ Generated ${Object.keys(categories).length} categories`);
}

main().catch(console.error);
