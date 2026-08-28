#!/usr/bin/env node
/**
 * Aggregate API - Fetches all api.json files from phenomenon repositories
 * and writes a flat shape downstream scripts and the frontend can consume.
 */
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

const OWNER = 'wyrdness';
const OUTPUT_DIR = path.join(__dirname, '../api/v1');

// Mirrors flattenPhenomenon in aggregate-local.js
function flattenPhenomenon(data) {
  const p = data.phenomenon || {};
  const dist = data.distribution || {};
  const range = dist.range || {};
  const temporal = dist.temporal || {};
  const firstRecorded = temporal.first_recorded || {};
  const history = data.history || {};
  const classification = data.classification || {};
  const cultural = data.cultural || {};
  const sightings = data.sightings || {};

  // Pull geocoded hotspots so the map view has coordinates to plot
  const locations = (dist.hotspots || [])
    .filter(h => h.location && h.location.coordinates
      && typeof h.location.coordinates.latitude === 'number'
      && typeof h.location.coordinates.longitude === 'number')
    .map(h => ({
      name: h.name || (h.location && h.location.description) || '',
      lat: h.location.coordinates.latitude,
      lng: h.location.coordinates.longitude
    }));

  return {
    id: p.id || data.id,
    name: p.name || data.name,
    category: (p.category || data.category || 'uncategorized').toLowerCase(),
    description: (p.description && p.description.summary) || p.description || data.description || '',
    full_description: (p.description && p.description.full) || (p.description && p.description.summary) || p.description || data.description || '',
    aliases: p.aliases || data.aliases || [],
    tags: p.tags || data.tags || [],
    status: p.status || data.status || 'unknown',
    regions: range.regions || range.countries || data.regions || [],
    origin: range.description || data.origin || '',
    first_reported: firstRecorded.date || data.first_reported || 'Unknown',
    danger_level: data.danger_level || 'unknown',
    evidence_level: data.evidence_level || 'unknown',
    etymology: p.etymology || null,
    sightings_stats: sightings.statistics || null,
    timeline: history.timeline || [],
    related: classification.related_phenomena || [],
    cultural_notes: (cultural.folklore && cultural.folklore.beliefs) || '',
    sources: data.sources || [],
    locations
  };
}

async function main() {
  console.log('Starting API aggregation...');

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  // Paginate so we get all repos, not just the first 100
  const repos = await octokit.paginate(octokit.repos.listForOrg, {
    org: OWNER,
    type: 'public',
    per_page: 100
  });

  console.log(`Found ${repos.length} repositories`);

  const phenomenonRepos = repos.filter(r => r.name !== 'wyrdness.github.io' && !r.name.startsWith('.'));

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const allData = [];
  const seenIds = new Set();
  let successCount = 0;
  let errorCount = 0;

  for (const repo of phenomenonRepos) {
    try {
      const { data: content } = await octokit.repos.getContent({
        owner: OWNER,
        repo: repo.name,
        path: 'api.json'
      });

      const jsonContent = Buffer.from(content.content, 'base64').toString();
      const rawData = JSON.parse(jsonContent);
      const flat = flattenPhenomenon(rawData);

      // Use repo name as the id when the api.json doesn't supply one
      flat.id = flat.id || repo.name;

      await fs.writeFile(
        path.join(OUTPUT_DIR, `${flat.id}.json`),
        JSON.stringify(flat, null, 2)
      );

      allData.push(flat);
      seenIds.add(flat.id);
      successCount++;
      if (successCount % 50 === 0) console.log(`  ${successCount} processed...`);
    } catch (error) {
      console.error(`✗ ${repo.name}: ${error.message}`);
      errorCount++;
    }
  }

  // Sort by id for deterministic output
  allData.sort((a, b) => (a.id || '').localeCompare(b.id || ''));

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
