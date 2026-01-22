// Favorites Module - LocalStorage
(function() {
  'use strict';

  const FavoritesModule = {
    storageKey: 'wyrdness_favorites',

    init() {
      this.attachEventListeners();
      this.updateUI();
    },

    attachEventListeners() {
      document.addEventListener('click', (e) => {
        const favoriteBtn = e.target.closest('[data-favorite-id]');
        if (favoriteBtn) {
          e.preventDefault();
          const id = favoriteBtn.dataset.favoriteId;
          this.toggle(id);
          this.updateButtonState(favoriteBtn, this.has(id));
        }
      });
    },

    get() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error reading favorites:', error);
        return [];
      }
    },

    save(favorites) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(favorites));
        return true;
      } catch (error) {
        console.error('Error saving favorites:', error);
        return false;
      }
    },

    add(phenomenonId) {
      const favorites = this.get();
      if (!favorites.includes(phenomenonId)){
        favorites.push(phenomenonId);
        this.save(favorites);
        this.dispatchEvent('added', phenomenonId);
      }
    },

    remove(phenomenonId) {
      const favorites = this.get();
      const filtered = favorites.filter(id => id !== phenomenonId);
      this.save(filtered);
      this.dispatchEvent('removed', phenomenonId);
    },

    toggle(phenomenonId) {
      if (this.has(phenomenonId)) {
        this.remove(phenomenonId);
      } else {
        this.add(phenomenonId);
      }
    },

    has(phenomenonId) {
      return this.get().includes(phenomenonId);
    },

    count() {
      return this.get().length;
    },

    clear() {
      localStorage.removeItem(this.storageKey);
      this.dispatchEvent('cleared');
    },

    exportData() {
      const favorites = this.get();
      const blob = new Blob([JSON.stringify(favorites, null, 2)], {
        type: 'application/json'
      });
      return URL.createObjectURL(blob);
    },

    importData(jsonString) {
      try {
        const favorites = JSON.parse(jsonString);
        if (Array.isArray(favorites)) {
          this.save(favorites);
          this.updateUI();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error importing favorites:', error);
        return false;
      }
    },

    updateUI() {
      const favoriteButtons = document.querySelectorAll('[data-favorite-id]');
      favoriteButtons.forEach(btn => {
        const id = btn.dataset.favoriteId;
        this.updateButtonState(btn, this.has(id));
      });
    },

    updateButtonState(button, isFavorite) {
      if (isFavorite) {
        button.classList.add('is-favorite');
        button.setAttribute('aria-pressed', 'true');
        button.querySelector('.favorite-icon').textContent = '★';
      } else {
        button.classList.remove('is-favorite');
        button.setAttribute('aria-pressed', 'false');
        button.querySelector('.favorite-icon').textContent = '☆';
      }
    },

    dispatchEvent(type, phenomenonId) {
      const event = new CustomEvent(`favorites:${type}`, {
        detail: { phenomenonId }
      });
      document.dispatchEvent(event);
    }
  };

  // Export to global scope
  window.FavoritesModule = FavoritesModule;
})();
