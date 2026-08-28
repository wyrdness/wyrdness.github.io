// Map Module (Leaflet.js integration)
(function() {
  'use strict';

  const MapModule = {
    map: null,
    markers: [],

    init(elementId = 'map') {
      const container = document.getElementById(elementId);
      if (!container)return;

      // Check if Leaflet is loaded
      if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        return;
      }

      // Initialize map
      this.map = L.map(elementId).setView([20, 0], 2);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(this.map);

      this.loadPhenomena();
    },

    async loadPhenomena() {
      try {
        const data = await window.API.getAllPhenomena();
        this.addMarkers(data.phenomena || data);
      } catch (error) {
        console.error('Failed to load phenomena:', error);
      }
    },

    addMarkers(phenomena) {
      phenomena.forEach(item => {
        (item.locations || []).forEach(loc => {
          if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;

          const marker = L.marker([loc.lat, loc.lng]).addTo(this.map);
          marker.bindPopup(`
            <strong>${item.name}</strong>${loc.name ? ` &mdash; ${loc.name}` : ''}<br>
            <em>${item.category}</em><br>
            <a href="/phenomena/${item.id}/">View Details</a>
          `);

          this.markers.push(marker);
        });
      });
    },

    clearMarkers() {
      this.markers.forEach(marker => marker.remove());
      this.markers = [];
    }
  };

  window.MapModule = MapModule;
})();
