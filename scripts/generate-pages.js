#!/usr/bin/env node
/**
 * Generate Pages - Creates static HTML pages from templates
 */
const fs = require('fs').promises;
const path = require('path');

const API_DIR = path.join(__dirname, '../api/v1');
const TEMPLATE_DIR = path.join(__dirname, '../templates');
const OUTPUT_DIR = path.join(__dirname, '../phenomena');

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function section(title, bodyHtml) {
  if (!bodyHtml) return '';
  return `<section style="margin-bottom: var(--space-xl);"><h2>${title}</h2>${bodyHtml}</section>`;
}

// Builds every optional on-page section (full account, etymology, timeline,
// sightings, cultural notes, related phenomena, tags, sources) so the full
// phenomenon record is readable on-site instead of linking out to the repo.
function buildExtraSections(item) {
  const parts = [];

  if (item.full_description && item.full_description !== item.description) {
    parts.push(section('Full Account', `<p>${escapeHtml(item.full_description)}</p>`));
  }

  if (item.aliases && item.aliases.length) {
    const list = item.aliases.map(a => {
      const extra = [a.language, a.region].filter(Boolean).map(escapeHtml).join(', ');
      return `<li>${escapeHtml(a.name || '')}${extra ? ` <span class="text-muted">(${extra})</span>` : ''}</li>`;
    }).join('');
    parts.push(section('Also Known As', `<ul>${list}</ul>`));
  }

  if (item.etymology && (item.etymology.origin || item.etymology.meaning || item.etymology.first_use)) {
    const e = item.etymology;
    const rows = [
      e.origin && `<dt style="font-weight: 600;">Origin:</dt><dd>${escapeHtml(e.origin)}</dd>`,
      e.meaning && `<dt style="font-weight: 600;">Meaning:</dt><dd>${escapeHtml(e.meaning)}</dd>`,
      e.first_use && `<dt style="font-weight: 600;">First Use:</dt><dd>${escapeHtml(e.first_use)}</dd>`
    ].filter(Boolean).join('');
    parts.push(section('Etymology', `<dl style="display: grid; grid-template-columns: auto 1fr; gap: var(--space-sm) var(--space-md);">${rows}</dl>`));
  }

  if (item.timeline && item.timeline.length) {
    const items = item.timeline.map(t => `<li><strong>${escapeHtml(t.date || '')}</strong> &mdash; ${escapeHtml(t.event || '')}${t.significance ? ` <span class="text-muted">(${escapeHtml(t.significance)})</span>` : ''}</li>`).join('');
    parts.push(section('Timeline', `<ul>${items}</ul>`));
  }

  if (item.sightings_stats) {
    const s = item.sightings_stats;
    const cells = ['total_documented', 'verified', 'disputed', 'debunked']
      .filter(k => typeof s[k] === 'number')
      .map(k => `<div><span class="badge">${s[k]}</span> ${k.replace(/_/g, ' ')}</div>`)
      .join('');
    if (cells) parts.push(section('Sightings &amp; Evidence', `<div class="flex gap--md" style="flex-wrap: wrap;">${cells}</div>`));
  }

  if (item.cultural_notes) {
    parts.push(section('Cultural Significance', `<p>${escapeHtml(item.cultural_notes)}</p>`));
  }

  if (item.related && item.related.length) {
    const items = item.related.map(r => {
      const label = escapeHtml(r.name || r.id || '');
      const desc = r.description ? ` &mdash; ${escapeHtml(r.description)}` : '';
      return r.id ? `<li><a href="/phenomena/${escapeHtml(r.id)}/">${label}</a>${desc}</li>` : `<li>${label}${desc}</li>`;
    }).join('');
    parts.push(section('Related Phenomena', `<ul>${items}</ul>`));
  }

  if (item.tags && item.tags.length) {
    const badges = item.tags.map(t => `<span class="badge badge--sm">${escapeHtml(t)}</span>`).join(' ');
    parts.push(section('Tags', `<div class="flex gap--xs" style="flex-wrap: wrap;">${badges}</div>`));
  }

  if (item.sources && item.sources.length) {
    const items = item.sources.map(s => {
      const title = escapeHtml(s.title || s.id || 'Source');
      const publication = s.publication ? ` &mdash; ${escapeHtml(s.publication)}` : '';
      return s.url
        ? `<li><a href="${escapeHtml(s.url)}" rel="noopener">${title}</a>${publication}</li>`
        : `<li>${title}${publication}</li>`;
    }).join('');
    parts.push(section('Sources', `<ul>${items}</ul>`));
  }

  return parts.join('\n');
}

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
      .replace(/{{EVIDENCE_LEVEL}}/g, item.evidence_level || 'unknown')
      .replace(/{{EXTRA_SECTIONS}}/g, buildExtraSections(item));

    const outputPath = path.join(OUTPUT_DIR, item.id);
    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(path.join(outputPath, 'index.html'), html);
    
    count++;
    if (count % 50 === 0) console.log(`  ${count} pages generated...`);
  }

  console.log(`✓ Generated ${count} phenomenon pages`);
}

main().catch(console.error);
