#!/usr/bin/env node
/**
 * Generate Categories - Creates category metadata
 */
const fs = require('fs').promises;
const path = require('path');

const API_DIR = path.join(__dirname, '../api/v1');
const TEMPLATE_DIR = path.join(__dirname, '../templates');
const OUTPUT_DIR = path.join(__dirname, '../categories');

// Mirrors the emoji map in categories/index.html's client-side script
const EMOJI_MAP = {
  cryptid: '🦍', ghost: '👻', ghost_haunting: '👻',
  mythological_creature: '🐲', mythological: '🐲',
  demon_angel: '😈', demon: '😈',
  alien: '👽', ufo_uap: '🛸',
  urban_legend: '🏙️', modern_internet_folklore: '💻', internet_folklore: '💻',
  paranormal: '✨', psychic_phenomena: '🔮',
  yokai: '👹', fae_folklore: '🧚',
  folklore: '📖', monster: '👾',
  spirit: '🌟', entity_spirit: '🌟',
  supernatural: '🔮', undead: '🧟',
  conspiracy_theory: '🕵️', anomaly: '❔',
  atmospheric_phenomenon: '🌩️', atmospheric_phenomena: '🌩️',
  location: '📍', haunted_location: '🏚️', location_phenomenon: '📍',
  shapeshifter: '🐺', shapeshifter_undead: '🐺',
  cultural_artifact: '🏺', uncategorized: '❓'
};

function prettyName(key) {
  if (!key || key === 'uncategorized') return 'Uncategorized';
  return key.replace(/[_|]/g, ' ').replace(/\s+/g, ' ').trim()
    .toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderCard(item) {
  return `
    <article class="phenomenon-card">
      <div class="phenomenon-card__content">
        <h2 class="phenomenon-card__title">
          <a class="phenomenon-card__link" href="/phenomena/${escapeHtml(item.id)}/">${escapeHtml(item.name)}</a>
        </h2>
        <div class="phenomenon-card__meta">
          <span class="badge badge--sm">${escapeHtml(prettyName(item.category))}</span>
          ${item.danger_level ? `<span class="badge badge--sm badge--danger">${escapeHtml(item.danger_level)}</span>` : ''}
        </div>
        <p class="phenomenon-card__description">${escapeHtml((item.description || '').substring(0, 140))}</p>
      </div>
    </article>`;
}

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

  // Generate a real /categories/{slug}/ page per category so "browse by
  // category" links to an actual filtered view instead of the overview page.
  const template = await fs.readFile(path.join(TEMPLATE_DIR, 'category.html'), 'utf8');

  for (const [slug, data] of Object.entries(categories)) {
    const items = indexData.phenomena
      .filter(p => (p.category || 'uncategorized') === slug)
      .sort((a, b) => a.name.localeCompare(b.name));

    const html = template
      .replace(/{{CATEGORY_LABEL}}/g, escapeHtml(prettyName(slug)))
      .replace(/{{CATEGORY_EMOJI}}/g, EMOJI_MAP[slug] || '❓')
      .replace(/{{COUNT}}/g, String(data.count))
      .replace(/{{ITEMS_HTML}}/g, items.map(renderCard).join(''));

    const outputPath = path.join(OUTPUT_DIR, slug);
    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(path.join(outputPath, 'index.html'), html);
  }

  console.log(`✓ Generated ${Object.keys(categories).length} category pages`);

  // Remove stale per-category output for a category that no longer has any
  // phenomena, so orphaned pages don't linger.
  const validSlugs = new Set(Object.keys(categories));
  const existingDirs = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
  let pruned = 0;

  for (const entry of existingDirs) {
    if (entry.isDirectory() && !validSlugs.has(entry.name)) {
      await fs.rm(path.join(OUTPUT_DIR, entry.name), { recursive: true, force: true });
      pruned++;
    }
  }

  if (pruned) console.log(`✓ Pruned ${pruned} orphaned category page(s)`);
}

main().catch(console.error);
