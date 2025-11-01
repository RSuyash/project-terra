# Architecture Draft (Preliminary)

> **Status:** 🔄 Pending discovery responses
> 
> This document will be continuously updated based on your answers to refine the technical architecture.

---

## Current Open Questions

### High-Impact Decisions Waiting On:

1. **Tech Stack Choice** → Depends on Q4, Q5, Q23
2. **Offline Strategy** → Depends on Q15, Q16
3. **Device Optimization** → Depends on Q2, Q17
4. **Deployment Model** → Depends on Q6, Q13, Q24
5. **Data Structure** → Depends on Q7-Q11
6. **Feature Priority** → Depends on Q18, Q19, Q22

---

## Provisional Architecture Concepts

### Concept A: Progressive Web App (PWA) Suite
**When to use:** If offline-first, mobile-heavy, or long-term project

**Tech Stack:**
- Frontend: React + Vite or Next.js
- Styling: Tailwind CSS or Material UI
- State: Zustand or Context API
- Storage: IndexedDB (via Dexie.js)
- Offline: Service Worker + Workbox
- Backend (optional): Supabase or Firebase
- Deployment: Netlify/Vercel

**Pros:** Professional, scalable, app-like experience
**Cons:** Setup overhead, learning curve

---

### Concept B: Vanilla HTML/CSS/JS Suite
**When to use:** If rapid MVP, desktop-focused, or learning project

**Tech Stack:**
- Core: Vanilla JavaScript (ES6+)
- Styling: CSS3 + Grid/Flexbox
- Storage: IndexedDB (vanilla API)
- Charts: Chart.js or Plotly.js
- Build: None (or simple bundler later)
- Deployment: GitHub Pages

**Pros:** No build step, easy to understand, fast iteration
**Cons:** Less maintainable at scale, manual state management

---

### Concept C: Hybrid Approach
**When to use:** If starting simple but want upgrade path

**Strategy:** Build Module 1-4 vanilla, then refactor to React

**Tech Stack:** Start B, migrate to A

**Pros:** Fast start, professional finish
**Cons:** Refactor overhead

---

## Module Dependencies & Data Flow

### Module Structure (Preliminary)

```
┌─────────────────────────────────────────┐
│   Core Shared Libraries                  │
├─────────────────────────────────────────┤
│ • Storage (IndexedDB wrapper)           │
│ • GPS (Geolocation helper)              │
│ • Validation (form rules)               │
│ • Export (CSV/Excel/JSON)               │
│ • Analytics (diversity calculations)    │
│ • Species DB (lookup/autocomplete)      │
└─────────────────────────────────────────┘
           │         │         │
           ▼         ▼         ▼
┌────────────┐  ┌──────────┐  ┌────────────┐
│ Vegetation │  │ Species- │  │ Biodiversity│
│  Plotting  │  │  Area    │  │  Analytics  │
│   Tool     │  │  Curve   │  │   Engine    │
└────────────┘  └──────────┘  └────────────┘
           │         │         │
           └─────────┴─────────┘
                    │
                    ▼
         ┌──────────────────┐
         │   Export & Sync  │
         │      Module      │
         └──────────────────┘
```

---

## Database Schema (Preliminary)

### Storage Structure

```javascript
// IndexedDB Object Stores (tentative)

database = {
  // Vegetation surveys
  vegetationPlots: {
    id: string,
    plotNumber: string,
    location: { lat, lng, accuracy, altitude },
    date: timestamp,
    observers: string[],
    metadata: { habitat, slope, aspect, notes },
    groundCover: {
      shrub: number, herb: number, grass: number,
      bare: number, rock: number, litter: number
    },
    disturbance: {
      grazing: boolean, poaching: boolean,
      lopping: boolean, invasives: boolean, fire: boolean
    },
    species: [
      {
        name: string,
        gbh: number,
        dbh: number,
        height: number,
        firstBranchHeight: number,
        canopyCover: number
      }
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
    synced: boolean
  },
  
  // Species-area curves
  nestedPlots: {
    id: string,
    location: { lat, lng },
    date: timestamp,
    plots: [
      {
        size: number, // 5, 10, 20, 40
        species: string[] // cumulative unique list
      }
    ],
    analysis: {
      c: number, // power law coefficient
      z: number, // power law exponent
      rSquared: number
    }
  },
  
  // Species reference database
  speciesDatabase: {
    name: string,
    scientificName: string,
    family: string,
    commonNames: string[],
    notes: string,
    photos: string[]
  },
  
  // User preferences
  settings: {
    units: { gbh: string, dbh: string, height: string },
    theme: string,
    exportFormat: string,
    defaultHabitat: string
  }
}
```

---

## Feature Priority Matrix

### Must-Have (MVP)
- ✅ Vegetation plotting data entry
- ✅ Offline storage
- ✅ CSV export
- ✅ Basic GPS capture
- ✅ Species-area curve tracking

### Should-Have (V1)
- ✅ Biodiversity indices
- ✅ Excel export
- ✅ Data validation
- ✅ Species autocomplete
- ✅ Chart visualizations

### Nice-to-Have (V2+)
- Cloud sync
- Photo integration
- AI species ID
- GIS mapping
- Report generation
- Bird surveys
- Water quality

---

## Next Steps

1. ✅ Wait for discovery responses
2. ⏳ Analyze responses & identify conflicts
3. ⏳ Ask targeted follow-up questions
4. ⏳ Finalize tech stack decision
5. ⏳ Create detailed data model
6. ⏳ Set up project structure
7. ⏳ Begin Module 1 implementation

---

## Notes & Assumptions

*(Will be updated based on responses)*

**Key Assumptions:**
- Offline-first is likely required (to be confirmed)
- Mobile-friendly UI needed (to be confirmed)
- Data privacy is important (to be confirmed)
- Rapid development preferred (to be confirmed)

**Risks to Address:**
- GPS accuracy in dense vegetation (waiting on Q3)
- Browser compatibility (waiting on Q2)
- Data loss prevention (waiting on Q15)
- User adoption curve (waiting on Q4, Q25)


