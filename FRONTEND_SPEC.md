# Wyrdness Frontend Specification

Generated from interactive planning wizard  
**Date:** 2026-01-22

## Technology Stack

**Framework/Library:** Vanilla HTML/CSS/JavaScript
- No frameworks or build tools required
- Progressive enhancement approach
- Works without JavaScript (core content accessible)

## Design Theme

**Visual Style:** Dark paranormal theme
- Dracula color palette
- Background: #282a36
- Foreground: #f8f8f2
- Primary accent: #bd93f9 (purple)
- Secondary accents: cyan, pink, green, orange
- WCAG AA compliance (minimum 4.5:1 contrast)

## Feature Scope

**Version:** Full-featured v1
- Browse/search all phenomena
- Category filtering and navigation
- Interactive map with Leaflet.js
- Timeline visualization
- Favorites with LocalStorage
- Responsive mobile-first design

## Deployment

**Platform:** GitHub Pages
- Automatic deployment via GitHub Actions
- Static site generation
- API aggregation from 516 repositories
- Updates every 6 hours

## Mapping Library

**Choice:** Leaflet.js
- Open-source, lightweight
- No API keys required
- Works with OpenStreetMap tiles
- Mobile-friendly

## Data Persistence

**Method:** Browser LocalStorage
- Favorites stored locally
- Export/import functionality
- No server required
- Privacy-friendly (no tracking)

## Technical Requirements

### Mobile-First Design
- Minimum width: 320px
- Breakpoints: 640px, 768px, 1024px, 1280px, 1536px
- Touch-friendly interface
- Optimized for small screens first

### Web Standards
- Valid HTML5
- Valid CSS3
- No inline styles (external stylesheets only)
- No inline JavaScript (exception: onclick="history.back()")
- Semantic HTML elements
- ARIA labels for accessibility

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Skip to main content link
- Focus indicators
- Sufficient color contrast

### Progressive Enhancement
1. **Level 1:** HTML only (readable, navigable)
2. **Level 2:** + CSS (visual design, layout)
3. **Level 3:** + JavaScript (interactivity, dynamic features)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript
- CSS Grid and Flexbox
- No IE11 support

## URL Structure

- `/` - Homepage
- `/browse/` - Browse all phenomena
- `/categories/` - Category overview
- `/categories/{category}/` - Category page
- `/phenomena/{id}/` - Individual phenomenon
- `/map/` - Interactive map
- `/timeline/` - Timeline view
- `/favorites/` - User favorites
- `/about/` - About page
- `/help/` - Help documentation
- `/api/v1/index.json` - API master list
- `/api/v1/{id}.json` - Individual API data

## API Design

### Endpoints
- `GET /api/v1/index.json` - All phenomena
- `GET /api/v1/categories.json` - Category breakdown
- `GET /api/v1/stats.json` - Statistics
- `GET /api/v1/{phenomenon-id}.json` - Individual entry

### Data Format
```json
{
  "version": "1.0.0",
  "generated": "2026-01-22T00:00:00Z",
  "total": 516,
  "phenomena": [...]
}
```

## Build Process

### GitHub Actions Workflows

1. **aggregate-api.yml** (Every 6 hours)
   - Fetch all api.json from 516 repositories
   - Generate /api/v1/index.json
   - Generate categories.json and stats.json
   - Commit and push

2. **generate-pages.yml** (On API changes)
   - Generate 516 static HTML pages from template
   - Use api.json data to populate
   - Commit and push

3. **deploy.yml** (On push to main)
   - Deploy to GitHub Pages
   - No build step required

4. **validate.yml** (On PR)
   - Validate HTML with html5validator
   - Check links with lychee
   - Ensure code quality

## File Organization

```
wyrdness.github.io/
├── css/                  # Stylesheets
│   ├── reset.css
│   ├── variables.css     # Design tokens
│   ├── base.css
│   ├── components.css    # BEM components
│   ├── utilities.css
│   ├── responsive.css
│   ├── print.css
│   └── main.css         # Imports all
├── js/                  # JavaScript modules
│   ├── api.js           # API client
│   ├── search.js        # Search functionality
│   ├── favorites.js     # LocalStorage
│   ├── map.js           # Leaflet integration
│   ├── timeline.js      # Timeline viz
│   ├── utils.js         # Utilities
│   └── app.js           # Main entry
├── scripts/             # Build scripts
│   ├── aggregate-api.js
│   ├── generate-pages.js
│   ├── generate-categories.js
│   ├── generate-stats.js
│   └── generate-index.js
├── templates/           # HTML templates
│   └── phenomenon.html
├── .github/workflows/   # CI/CD
├── api/v1/             # Generated (ignored)
├── phenomena/          # Generated (ignored)
├── images/             # Static assets
├── about/index.html
├── browse/index.html
├── categories/index.html
├── favorites/index.html
├── help/index.html
├── map/index.html
├── timeline/index.html
├── index.html
├── 404.html
├── manifest.json       # PWA
├── robots.txt
├── package.json
└── README.md
```

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: 90+ (all categories)
- Bundle size: < 50KB (CSS + JS combined)
- Static HTML generation for SEO

## Security

- No external tracking scripts
- No cookies
- No personal data collection
- HTTPS only (via GitHub Pages)
- Content Security Policy headers
- Subresource Integrity for CDN resources

## Future Enhancements (v2)

- [ ] Service worker for offline support
- [ ] Sitemap generation
- [ ] RSS feed for updates
- [ ] Social sharing cards
- [ ] Print-friendly pages
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] User-submitted sightings (via GitHub Issues)
