// API Helper Functions
(function() {
  'use strict';

  // Flatten nested {meta, phenomenon, classification, distribution, ...} into the
  // flat shape (id, name, category, description, regions, ...) that the UI expects.
  function normalizePhenomenon(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    if (raw.id && raw.name && !raw.phenomenon) return raw;

    const p = raw.phenomenon || {};
    const distribution = raw.distribution || {};
    const range = distribution.range || {};
    const firstRecorded = distribution.temporal && distribution.temporal.first_recorded || {};
    const desc = p.description || {};
    const yearMatch = typeof firstRecorded.date === 'string' ? firstRecorded.date.match(/-?\d{3,4}/) : null;

    return {
      id: p.id,
      name: p.name,
      aliases: p.aliases || [],
      category: (p.category || '').toLowerCase(),
      subcategory: p.subcategory,
      tags: p.tags || [],
      status: p.status,
      description: typeof desc === 'string' ? desc : (desc.summary || desc.full || ''),
      region: range.description || (raw.history && raw.history.origins && raw.history.origins.cultural_roots) || '',
      regions: range.regions || range.countries || [],
      first_reported: yearMatch ? yearMatch[0] : null,
      danger_level: p.danger_level,
      _raw: raw
    };
  }

  const API = {
    baseUrl: '/api/v1',
    cache: new Map(),

    /**
     * Fetch data with caching
     */
    async fetch(endpoint) {
      // Check cache first
      if (this.cache.has(endpoint)) {
        return this.cache.get(endpoint);
      }

      try {
        const response = await fetch(`${this.baseUrl}/${endpoint}`);

        if (!response.ok){
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.cache.set(endpoint, data);
        return data;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }
    },

    /**
     * Get all phenomena index (normalized)
     */
    async getAllPhenomena() {
      const data = await this.fetch('index.json');
      const list = Array.isArray(data) ? data : (data.phenomena || []);
      return {
        ...(Array.isArray(data) ? {} : data),
        phenomena: list.map(normalizePhenomenon)
      };
    },

    /**
     * Get single phenomenon (normalized, with raw under ._raw)
     */
    async getPhenomenon(id) {
      const raw = await this.fetch(`${id}.json`);
      return normalizePhenomenon(raw);
    },

    /**
     * Get all categories
     */
    async getCategories() {
      return this.fetch('categories.json');
    },

    /**
     * Get site statistics
     */
    async getStats() {
      return this.fetch('stats.json');
    },

    /**
     * Search phenomena
     */
    async search(query, filters = {}) {
      const allData = await this.getAllPhenomena();
      const q = query.toLowerCase();
      
      let results = allData.phenomena.filter(p => {
        // Text search
        const matchesQuery = !query||
          p.name.toLowerCase().includes(q) ||
          p.aliases?.some(a => a.toLowerCase().includes(q)) ||
          p.category?.toLowerCase().includes(q) ||
          p.region?.toLowerCase().includes(q);
        
        // Category filter
        const matchesCategory = !filters.category||
          p.category === filters.category;
        
        // Region filter
        const matchesRegion = !filters.region||
          p.region === filters.region;
        
        // Status filter
        const matchesStatus = !filters.status||
          p.status === filters.status;
        
        return matchesQuery && matchesCategory && matchesRegion && matchesStatus;
      });
      
      return results;
    },

    /**
     * Get phenomena by category
     */
    async getByCategory(category) {
      const allData = await this.getAllPhenomena();
      return allData.phenomena.filter(p => p.category === category);
    },

    /**
     * Clear cache
     */
    clearCache() {
      this.cache.clear();
    }
  };

  // Export to global scope
  window.API = API;
})();
