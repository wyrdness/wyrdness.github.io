#!/usr/bin/env node
/**
 * Aggregate API - Fetches all api.json files from phenomenon repositories
 */
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

const OWNER = 'wyrdness';
const OUTPUT_DIR = path.join(__dirname, '../api/v1');

async function main() {
  console.log('Starting API aggregation...');
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  // Get all repositories
  const { data: repos } = await octokit.repos.listForOrg({
    org: OWNER,
    type: 'public',
    per_page: 100
  });

  console.log(`Found ${repos.length} repositories`);

  // Filter out the main site repo
  const phenomenonRepos = repos.filter(r => r.name !== 'wyrdness.github.io');
  
  const allData = [];
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
      const phenomenonData = JSON.parse(jsonContent);
      
      // Save individual file
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
      await fs.writeFile(
        path.join(OUTPUT_DIR, `${repo.name}.json`),
        JSON.stringify(phenomenonData, null, 2)
      );

      allData.push(phenomenonData);
      successCount++;
      console.log(`✓ ${repo.name}`);
    } catch (error) {
      console.error(`✗ ${repo.name}: ${error.message}`);
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
