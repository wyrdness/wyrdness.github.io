// Search Module
(function() {
  'use strict';

  const SearchModule = {
    searchInput: null,
    resultsContainer: null,
    debounceTimer: null,

    init() {
      this.searchInput = document.querySelector('[data-search-input]');
      this.resultsContainer = document.querySelector('[data-search-results]');
      
      if (!this.searchInput)return;
      
      this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.clear Results();
        }
      });
    },

    handleSearch(event) {
      const query = event.target.value.trim();
      
      // Clear previous timer
      clearTimeout(this.debounceTimer);
      
      // Debounce search (wait 300ms after user stops typing)
      this.debounceTimer = setTimeout(() => {
        if (query.length >= 2) {
          this.performSearch(query);
        } else {
          this.clearResults();
        }
      }, 300);
    },

    async performSearch(query) {
      if (!this.resultsContainer)return;
      
      try {
        this.showLoading();
        
        const results = await window.API.search(query);
        this.displayResults(results, query);
      } catch (error) {
        console.error('Search error:', error);
        this.showError();
      }
    },

    displayResults(results, query) {
      if (!this.resultsContainer)return;
      
      if (results.length === 0) {
        this.resultsContainer.innerHTML = `
          <div class="search-results__empty">
            <p>No phenomena found for "${query}"</p>
          </div>
        `;
        return;
      }
      
      const html = results.map(phenomenon => `
        <article class="search-result">
          <h3 class="search-result__title">
            <a href="/phenomena/${phenomenon.id}/">${phenomenon.name}</a>
          </h3>
          <div class="search-result__meta">
            <span class="badge badge--${phenomenon.category.toLowerCase()}">${phenomenon.category}</span>
            ${phenomenon.region ? `<span class="text-muted">${phenomenon.region}</span>` : ''}
          </div>
        </article>
      `).join('');
      
      this.resultsContainer.innerHTML = html;
    },

    showLoading() {
      if (!this.resultsContainer)return;
      this.resultsContainer.innerHTML = '<div class="loading"></div>';
    },

    showError() {
      if (!this.resultsContainer)return;
      this.resultsContainer.innerHTML = `
        <div class="error">Failed to load search results. Please try again.</div>
      `;
    },

    clearResults() {
      if (this.resultsContainer) {
        this.resultsContainer.innerHTML = '';
      }
    }
  };

  // Export to global scope
  window.SearchModule = SearchModule;
})();
