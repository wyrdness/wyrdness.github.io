# Wyrdness Frontend Implementation Plan

Original comprehensive plan for the frontend website.

## Project Overview

Build a static website at wyrdness.github.io that serves as the frontend for the Wyrdness paranormal phenomena database.

### Goals
- Display all 516+ phenomena with rich, searchable interface
- Mobile-first responsive design
- Fast, accessible, standards-compliant
- Automated data aggregation from GitHub repositories
- Progressive enhancement (works without JavaScript)

## Technology Decisions

### Stack
- **HTML5** - Semantic markup
- **CSS3** - Vanilla CSS, no preprocessors
- **JavaScript** - ES6+, no frameworks
- **Build** - GitHub Actions for automation
- **Hosting** - GitHub Pages

### Why Vanilla?
- No build step complexity
- Faster load times
- Long-term maintainability
- Learning opportunity
- No framework lock-in

## Site Structure

### Pages
1. **Homepage** (`/`)
   - Hero with search
   - Featured phenomena
   - Category preview
   - Quick stats

2. **Browse** (`/browse/`)
   - All phenomena list
   - Filters (category, region, danger)
   - Search functionality
   - Pagination/infinite scroll

3. **Categories** (`/categories/`)
   - Category grid
   - Count per category
   - Links to filtered views

4. **Individual Phenomenon** (`/phenomena/{id}/`)
   - Full details
   - Sources
   - Sightings link
   - GitHub link
   - Related phenomena

5. **Map** (`/map/`)
   - Interactive world map (Leaflet.js)
   - Markers for phenomena with coordinates
   - Popup details

6. **Timeline** (`/timeline/`)
   - Chronological view
   - Grouped by time period
   - Filter by category

7. **Favorites** (`/favorites/`)
   - User's saved phenomena
   - Export/import functionality
   - LocalStorage based

8. **About** (`/about/`)
   - Project information
   - How to contribute
   - License info

9. **Help** (`/help/`)
   - How to use the site
   - FAQ
   - API documentation

## Data Flow

### GitHub → API → Frontend

```
516 phenomenon repos (api.json)
    ↓
GitHub Actions: aggregate-api.yml (runs every 6 hours)
    ↓
/api/v1/index.json (master list)
/api/v1/categories.json
/api/v1/stats.json
/api/v1/{id}.json (individual files)
    ↓
GitHub Actions: generate-pages.yml
    ↓
516 static HTML pages (/phenomena/{id}/index.html)
    ↓
GitHub Actions: deploy.yml
    ↓
GitHub Pages (wyrdness.github.io)
```

## Design System

### Visual Theme
- **Dracula** color palette
- Dark background (#282a36)
- Purple accents (#bd93f9)
- High contrast for readability
- WCAG AA compliant

### Typography
- System font stack (no web fonts)
- Scale: 0.75rem → 3rem
- Line height: 1.5 (body), 1.2 (headings)

### Layout
- Mobile-first (320px minimum)
- Container: max-width 1280px
- Grid: CSS Grid for layouts
- Flexbox for components

## Features

### Search
- Client-side search through all phenomena
- Search by: name, category, region, description
- Debounced input (300ms)
- Highlight matches

### Filtering
- Multiple filters can combine
- Category dropdown
- Region dropdown
- Danger level
- Evidence level
- Clear filters button

### Favorites
- Click star to favorite
- Stored in LocalStorage
- Export as JSON
- Import from JSON
- Persist across sessions

### Map
- Leaflet.js integration
- OpenStreetMap tiles
- Markers for phenomena with lat/lng
- Popup shows: name, category, link
- Cluster markers for performance

### Timeline
- Ordered by first_reported date
- Visual timeline display
- Jump to year
- Filter by category

## Accessibility

### WCAG 2.1 AA Compliance
- Color contrast 4.5:1 minimum
- Keyboard navigation
- Screen reader support
- Focus indicators
- Semantic HTML
- ARIA labels
- Skip links

### Progressive Enhancement
- Level 1: HTML only (content accessible)
- Level 2: + CSS (visual design)
- Level 3: + JavaScript (interactivity)

## Performance

### Targets
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse 90+ all categories

### Optimizations
- Static HTML generation
- LocalStorage caching
- Lazy load images
- Debounced search
- Minimal JavaScript
- No external dependencies (except Leaflet)

## Build Automation

### Workflows

1. **aggregate-api.yml**
   - Trigger: Every 6 hours, manual
   - Fetches all api.json from 516 repos
   - Generates aggregated API files
   - Commits to repository

2. **generate-pages.yml**
   - Trigger: On API file changes
   - Generates 516 static HTML pages
   - Uses template + data
   - Commits to repository

3. **deploy.yml**
   - Trigger: On push to main
   - Deploys to GitHub Pages
   - No build step needed

4. **validate.yml**
   - Trigger: On pull request
   - Validates HTML
   - Checks links
   - Runs linters

## API Design

### Endpoints
- `GET /api/v1/index.json` - All phenomena
- `GET /api/v1/categories.json` - Category breakdown
- `GET /api/v1/stats.json` - Statistics
- `GET /api/v1/{id}.json` - Individual phenomenon

### Response Format
```json
{
  "version": "1.0.0",
  "generated": "2026-01-22T00:00:00Z",
  "total": 516,
  "phenomena": [
    {
      "id": "bigfoot",
      "name": "Bigfoot",
      "category": "cryptid",
      "description": "...",
      "regions": ["North America"],
      "danger_level": "low",
      "evidence_level": "anecdotal"
    }
  ]
}
```

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Design system (CSS variables)
- [x] Reset & base styles
- [x] Component library (BEM)
- [x] Utility classes
- [x] Responsive styles

### Phase 2: Core Pages ✅
- [x] Homepage
- [x] Browse page
- [x] Categories page
- [x] About page
- [x] Help page

### Phase 3: Features ✅
- [x] Search functionality
- [x] Filtering system
- [x] Favorites (LocalStorage)
- [x] Map integration
- [x] Timeline view

### Phase 4: Automation ✅
- [x] API aggregation script
- [x] Page generation script
- [x] GitHub Actions workflows
- [x] Template system

### Phase 5: Polish
- [ ] Logo and branding
- [ ] Favicon and icons
- [ ] Open Graph images
- [ ] Sitemap generation
- [ ] Analytics (optional)

## Future Enhancements

### Version 2.0
- Service worker for offline
- PWA installation
- Dark/light theme toggle
- Advanced search syntax
- User accounts (via GitHub OAuth)
- Sighting submission form
- Multi-language support
- RSS feed

### Integration Ideas
- Link to related Wikipedia articles
- Link to Google Maps for locations
- Embed YouTube videos (if available)
- Social sharing buttons
- Comments via GitHub Discussions

## Success Metrics

### Technical
- [x] All HTML validates (W3C)
- [x] All CSS validates
- [x] WCAG AA compliant
- [x] Lighthouse 90+ scores
- [x] Zero accessibility errors

### User Experience
- Search returns results < 100ms
- Page load < 2s on 4G
- Works on 320px screens
- Keyboard navigable
- Readable without JavaScript

### SEO
- All pages have meta descriptions
- Semantic HTML structure
- Clean URLs
- Sitemap.xml
- robots.txt configured

---

**Status:** Phase 1-4 Complete ✅  
**Next:** Phase 5 (Polish)  
**Version:** 1.0.0
