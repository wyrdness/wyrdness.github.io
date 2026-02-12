# Wyrdness Frontend Architecture

Complete technical documentation for the Wyrdness paranormal phenomena database frontend.

## Design System

### Color Palette (Dracula Theme)

```css
/* Background */
--bg-primary: #282a36;      /* Main background */
--bg-secondary: #44475a;    /* Cards, sections */
--bg-tertiary: #6272a4;     /* Hover states */

/* Text */
--text-primary: #f8f8f2;    /* Main text (15.6:1 contrast) */
--text-secondary: #e9e9e4;  /* Secondary text */
--text-muted: #a0a0a0;      /* Muted text */

/* Accents */
--accent-purple: #bd93f9;   /* Primary accent */
--accent-pink: #ff79c6;     /* Links, highlights */
--accent-cyan: #8be9fd;     /* Info, secondary */
--accent-green: #50fa7b;    /* Success */
--accent-yellow: #f1fa8c;   /* Warning */
--accent-orange: #ffb86c;   /* Attention */
--accent-red: #ff5555;      /* Danger */

/* Borders */
--border-color: #44475a;
```

### Typography Scale

```css
--font-xs: 0.75rem;    /* 12px */
--font-sm: 0.875rem;   /* 14px */
--font-base: 1rem;     /* 16px */
--font-lg: 1.125rem;   /* 18px */
--font-xl: 1.25rem;    /* 20px */
--font-2xl: 1.5rem;    /* 24px */
--font-3xl: 1.875rem;  /* 30px */
--font-4xl: 2.25rem;   /* 36px */
--font-5xl: 3rem;      /* 48px */
```

### Spacing Scale

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## Component Library (BEM)

### Header
```html
<header class="site-header">
  <div class="container">
    <div class="site-header__content">
      <a href="/" class="site-header__logo">Wyrdness</a>
      <nav class="site-nav">...</nav>
    </div>
  </div>
</header>
```

### Navigation
```html
<nav class="site-nav">
  <ul class="site-nav__list">
    <li class="site-nav__item">
      <a href="/browse/" class="site-nav__link site-nav__link--active">Browse</a>
    </li>
  </ul>
</nav>
```

### Cards
```html
<article class="card">
  <div class="card__header">
    <h3 class="card__title">Title</h3>
  </div>
  <div class="card__body">
    Content
  </div>
  <div class="card__footer">
    Actions
  </div>
</article>
```

### Badges
```html
<span class="badge">Default</span>
<span class="badge badge--primary">Primary</span>
<span class="badge badge--danger">Danger</span>
<span class="badge badge--warning">Warning</span>
<span class="badge badge--success">Success</span>
<span class="badge badge--sm">Small</span>
```

### Buttons
```html
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--danger">Danger</button>
<button class="btn btn--sm">Small</button>
<button class="btn btn--lg">Large</button>
```

### Forms
```html
<form class="form">
  <div class="form-group">
    <label for="input" class="form-label">Label</label>
    <input type="text" id="input" class="form-control">
  </div>
</form>
```

### Search
```html
<form class="search-form">
  <input type="search" class="search-form__input" placeholder="Search...">
  <button class="search-form__button">Search</button>
</form>
```

## Utility Classes

### Display
```css
.block { display: block; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }
```

### Flexbox
```css
.flex--center { justify-content: center; align-items: center; }
.flex--between { justify-content: space-between; }
.flex--around { justify-content: space-around; }
.flex--wrap { flex-wrap: wrap; }
```

### Grid
```css
.grid--2 { grid-template-columns: repeat(2, 1fr); }
.grid--3 { grid-template-columns: repeat(3, 1fr); }
.grid--4 { grid-template-columns: repeat(4, 1fr); }
.gap--sm { gap: var(--space-sm); }
.gap--md { gap: var(--space-md); }
.gap--lg { gap: var(--space-lg); }
```

### Spacing
```css
.m-{size} { margin: var(--space-{size}); }
.mt-{size} { margin-top: var(--space-{size}); }
.mb-{size} { margin-bottom: var(--space-{size}); }
.p-{size} { padding: var(--space-{size}); }
/* Available sizes: xs, sm, md, lg, xl, 2xl, 3xl */
```

### Typography
```css
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-muted { color: var(--text-muted); }
.text-primary { color: var(--accent-purple); }
```

## JavaScript Architecture

### Module Pattern
All JavaScript uses IIFE pattern to avoid global pollution:

```javascript
(function() {
  'use strict';
  
  const Module = {
    init() { /* ... */ }
  };
  
  window.Module = Module;
})();
```

### API Client (api.js)
```javascript
window.API.getAllPhenomena()      // Returns Promise<Array>
window.API.getPhenomenon(id)      // Returns Promise<Object>
window.API.search(query, filters) // Returns Promise<Array>
window.API.clearCache()           // Clears localStorage cache
```

### Favorites (favorites.js)
```javascript
window.FavoritesModule.add(id)      // Add to favorites
window.FavoritesModule.remove(id)   // Remove from favorites
window.FavoritesModule.toggle(id)   // Toggle favorite
window.FavoritesModule.has(id)      // Check if favorited
window.FavoritesModule.getAll()     // Get all favorite IDs
window.FavoritesModule.exportData() // Export as JSON string
window.FavoritesModule.importData(json) // Import from JSON
```

### Search (search.js)
```javascript
window.SearchModule.init()          // Initialize search
window.SearchModule.search(query)   // Perform search
```

### Utils (utils.js)
```javascript
window.Utils.debounce(fn, wait)     // Debounce function
window.Utils.throttle(fn, limit)    // Throttle function
window.Utils.formatDate(date)       // Format date string
window.Utils.slugify(text)          // Create URL slug
window.Utils.lazyLoadImages()       // Enable lazy loading
```

## Accessibility Features

### Keyboard Navigation
- Skip to main content link (hidden until focused)
- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order

### Screen Readers
- Semantic HTML elements
- ARIA labels on all icons and buttons
- `role` attributes where needed
- Alt text on all images
- `aria-live` regions for dynamic content

### WCAG AA Compliance
- Minimum 4.5:1 contrast ratio for text
- 3:1 for large text and UI components
- Resizable text up to 200%
- No content flash or animation issues
- Form labels properly associated

## Performance Optimizations

### CSS
- Single CSS bundle via imports
- Critical CSS inlined (future)
- Print stylesheet separate
- No unused styles

### JavaScript
- Modules loaded with `defer`
- Debounced search input
- Lazy loading images
- LocalStorage caching of API responses

### HTML
- Static generation for all pages
- Semantic structure reduces CSS complexity
- Minimal inline styles
- Clean URLs

## Browser Support

### Required Features
- CSS Grid and Flexbox
- ES6+ (const, let, arrow functions, async/await)
- Fetch API
- LocalStorage
- IntersectionObserver (lazy loading)

### Graceful Degradation
- Works without JavaScript (basic navigation)
- LocalStorage failure handled
- Fetch failure shows error message
- Map requires Leaflet CDN

## Directory Structure Reference

```
wyrdness.github.io/
├── css/
│   ├── reset.css           # Modern CSS reset
│   ├── variables.css       # Design tokens
│   ├── base.css           # Base styles
│   ├── components.css     # BEM components
│   ├── utilities.css      # Utility classes
│   ├── responsive.css     # Media queries
│   ├── print.css          # Print styles
│   └── main.css           # Master import
├── js/
│   ├── api.js             # API client
│   ├── search.js          # Search module
│   ├── favorites.js       # Favorites management
│   ├── map.js             # Leaflet integration
│   ├── timeline.js        # Timeline visualization
│   ├── utils.js           # Utility functions
│   └── app.js             # Main application
├── scripts/
│   ├── aggregate-api.js
│   ├── generate-pages.js
│   ├── generate-categories.js
│   ├── generate-stats.js
│   └── generate-index.js
├── templates/
│   └── phenomenon.html
├── .github/workflows/
│   ├── aggregate-api.yml
│   ├── generate-pages.yml
│   ├── deploy.yml
│   └── validate.yml
├── api/v1/              # Generated
├── phenomena/           # Generated
├── images/
├── about/index.html
├── browse/index.html
├── categories/index.html
├── favorites/index.html
├── help/index.html
├── map/index.html
├── timeline/index.html
├── index.html
├── 404.html
├── manifest.json
├── robots.txt
├── package.json
└── README.md
```

## Deployment Workflow

1. **Developer pushes to main**
2. **aggregate-api workflow runs** (if scheduled or manual)
   - Fetches all 516 api.json files from GitHub
   - Generates /api/v1/index.json
   - Generates categories.json and stats.json
   - Commits results
3. **generate-pages workflow runs** (on API changes)
   - Reads /api/v1/index.json
   - Generates 516 static HTML pages
   - Commits results
4. **deploy workflow runs** (on any push to main)
   - Uploads entire site to GitHub Pages
   - Site live at wyrdness.github.io

## Code Style Guidelines

### HTML
- Use semantic elements
- Lowercase tag names
- Quote all attributes
- Self-close void elements
- Maximum 100 characters per line

### CSS
- BEM methodology for components
- Utility classes for spacing/layout
- CSS custom properties for values
- Mobile-first media queries
- Comments for sections

### JavaScript
- ES6+ features
- Strict mode
- Descriptive variable names
- JSDoc comments for functions
- Error handling with try/catch

---

**Last Updated:** 2026-01-22  
**Version:** 1.0.0
