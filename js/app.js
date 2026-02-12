// Main Application
(function() {
  'use strict';

  const App = {
    init() {
      console.log('Wyrdness initializing...');
      
      // Check for required features
      if (!window.Utils.isSupported('localStorage')){
        console.warn('LocalStorage not supported - favorites disabled');
      }
      
      if (!window.Utils.isSupported('fetch')){
        console.error('Fetch API not supported');
        this.showBrowserWarning();
        return;
      }
      
      // Initialize modules
      if (window.SearchModule) {
        window.SearchModule.init();
      }
      
      if (window.FavoritesModule && window.Utils.isSupported('localStorage')) {
        window.FavoritesModule.init();
      }
      
      // Lazy load images
      window.Utils.lazyLoadImages();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('Wyrdness ready');
    },

    setupEventListeners() {
      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href === '#') return;
          
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
      
      // External link indicator
      document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.getAttribute('target')){
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    },

    showBrowserWarning() {
      const warning = document.createElement('div');
      warning.className = 'error';
      warning.innerHTML = `
        <strong>Browser not supported</strong>
        <p>Please use a modern browser (Chrome, Firefox, Safari, Edge).</p>
      `;
      document.body.insertBefore(warning, document.body.firstChild);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();
