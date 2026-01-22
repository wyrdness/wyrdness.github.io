// Timeline Module
(function() {
  'use strict';

  const TimelineModule = {
    container: null,
    data: [],

    init(elementId = 'timeline') {
      this.container = document.getElementById(elementId);
      if (!this.container)return;

      this.loadData();
    },

    async loadData() {
      try {
        const data = await window.API.getAllPhenomena();
        this.data = this.processData(data.phenomena || data);
        this.render();
      } catch (error) {
        console.error('Failed to load timeline data:', error);
      }
    },

    processData(phenomena) {
      return phenomena
        .filter(item => item.first_reported)
        .map(item => ({
          id: item.id,
          name: item.name,
          year: parseInt(item.first_reported),
          category: item.category,
          region: item.regions?.[0] || 'Unknown'
        }))
        .sort((a, b) => a.year - b.year);
    },

    render() {
      if (!this.data.length){
        this.container.innerHTML = '<p>No timeline data available.</p>';
        return;
      }

      const html = this.data.map(item => `
        <div class="timeline-item" style="padding: var(--space-md); border-left: 2px solid var(--accent-purple); margin-bottom: var(--space-md);">
          <span class="badge badge--sm" style="background: var(--accent-purple);">${item.year}</span>
          <h3 style="margin: var(--space-sm) 0;">
            <a href="/phenomena/${item.id}/">${item.name}</a>
          </h3>
          <p class="text-muted">${item.category} &bull; ${item.region}</p>
        </div>
      `).join('');

      this.container.innerHTML = html;
    }
  };

  window.TimelineModule = TimelineModule;
})();
