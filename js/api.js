// API Helper Functions
(function() {
  'use strict';

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
     * Get all phenomena index
     */
    async getAllPhenomena() {
      return this.fetch('index.json');
    },

    /**
     * Get single phenomenon
     */
    async getPhenomenon(id) {
      return this.fetch(`${id}.json`);
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
