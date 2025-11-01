# Final MVP Scope - APPROVED

**Status:** ✅ All decisions made, ready to code!

**Last Updated:** All follow-up questions answered

---

## ✅ Final MVP Feature List

### Core Vegetation Plotting
- [x] Single plot entry form
- [x] Species add/search (local database with autocomplete)
- [x] Tree measurements (GBH, DBH, height, height at first branch)
- [x] Canopy cover percentage
- [x] Ground cover percentages (shrub, herb, grass, bare, rock, litter)
- [x] Disturbance indicators (grazing, poaching, lopping, invasives, fire)
- [x] GPS capture (lat/lng + accuracy)
- [x] Plot metadata (observers, date, plot number, habitat, notes)

### Canopy Photo Analysis (CRITICAL ADDITION)
- [x] **Photo capture** (4 angles: center + 4 quadrants)
- [x] **Photo storage** (IndexedDB)
- [x] **Photo merging** (combine 4 photos to reduce error)
- [x] **Auto analysis** (canopy percentage from merged image)
- [x] **Data output** (canopy coverage metrics integrated with plot)

### Species-Area Curve
- [x] Fixed nested plot sizes: 5×5m, 10×10m, 20×20m, 40×40m
- [x] Cumulative species tracking
- [x] Auto-plot generation (S vs Area)
- [x] Power law fitting (linear regression)
- [x] Display c and z parameters

### Biodiversity Analytics
- [x] Shannon-Wiener Index (H')
- [x] Simpson's Index (D and 1-D)
- [x] Species Richness (S)
- [x] Pielou's Evenness (J)

### Data Management
- [x] IndexedDB storage (offline-first)
- [x] CSV export
- [x] Data validation
- [x] Backup/restore (local export)

### UI/UX
- [x] Mobile-responsive (works on phones, tablets, laptops)
- [x] Dark mode
- [x] High contrast (harsh field conditions)
- [x] Large touch targets
- [x] Offline indicator
- [x] Minimalist, clean design

### Export & Reporting
- [x] CSV export (Google Sheets compatible)
- [x] HTML/Markdown reports
- [x] Data validation before export

### Deployment
- [x] Deploy to Vercel
- [x] PWA capable
- [x] Service worker (works offline)
- [x] Responsive design

---

## ❌ NOT in MVP (V1/V2)

### Advanced Plot Types
- Transects
- Grid surveys
- Variable nested plot sizes

### Advanced Analysis
- Menhinick's Index
- Margalef's Index
- Temporal comparisons
- Statistical tests

### Advanced Features
- Excel export (CSV only in MVP)
- PDF reports (HTML/MD in MVP)
- Cloud sync
- GIS mapping
- Bird surveys
- Water quality
- Soil sampling
- Global species API

---

## 🎯 Technical Stack (APPROVED)

```yaml
Frontend:
  - React 18+ with Vite
  - TypeScript (type safety)
  - Tailwind CSS + Dark mode
  
Storage:
  - IndexedDB + Dexie.js (local-only MVP)
  
Charts:
  - Recharts or Victory
  
Offline:
  - Service Worker + Workbox
  
Image Processing:
  - HTML5 Canvas API (photo merging)
  - Image analysis algorithms
  
Export:
  - Papa Parse (CSV)
  
Deployment:
  - Vercel
  
Authentication:
  - None (MVP)
  
Backend:
  - None (MVP, local-only)
  - V1: Add Supabase/Firebase for sync
```

---

## ⏱️ Realistic Timeline

**Updated: 5-6 days** (canopy photos add complexity)

### Day 1: Foundation
- React + Vite setup
- Tailwind + Dark mode
- Core data models
- IndexedDB schema

### Day 2: Vegetation + Biodiversity
- Plot entry form
- Species management
- GPS capture
- Biodiversity indices

### Day 3: Canopy Photos (NEW)
- Photo capture UI
- Store 4 photos in IndexedDB
- Photo merging algorithm
- Canopy percentage analysis

### Day 4: Species-Area + Polish
- Species-area curve
- Data validation
- CSV export
- Error handling

### Day 5: Testing + Deploy
- Cross-device testing
- Offline testing
- Deploy to Vercel
- PWA configuration

### Day 6: Buffer
- Bug fixes
- Edge cases
- Documentation
- Final polish

---

## 🔧 Canopy Photo Implementation Details

### Challenge
Auto-analyze canopy coverage from merged 4-quadrant photos.

### Approaches

#### Option A: Threshold-based (Simpler)
```javascript
// Convert to grayscale
// Apply threshold (sky vs canopy)
// Calculate percentage of canopy pixels
```

**Pros:** Fast, works offline, good accuracy  
**Cons:** Sensitive to lighting conditions

#### Option B: ML Model (Advanced)
```javascript
// Use TensorFlow.js
// Pre-trained canopy segmentation model
// More accurate in varied conditions
```

**Pros:** Better accuracy, handles shadows  
**Cons:** Large model size, complex setup

#### MVP Approach: Hybrid
Start with threshold-based, add ML in V1 if needed.

---

## 📋 License Decision

**Your Requirements:**
- Preventing others from using code
- Preventing commercial use
- Ensuring attribution

**Solution:** **Custom License or AGPL-3.0**

Options:
1. **AGPL-3.0** - Prevents commercial use without contributions back
2. **Custom License** - Specify exactly what you want
3. **MIT + CLA** - Allows use but requires contributor agreement

**Recommendation:** Start with AGPL-3.0 for open-source protection.

---

## ✅ All Approvals Received

- [x] MVP scope approved (with canopy photos)
- [x] Tech stack approved (React + PWA)
- [x] Timeline accepted (5-6 days)
- [x] Architecture approved (IndexedDB + offline-first)
- [x] Deployment approved (Vercel)
- [x] Authentication decided (none for MVP)
- [x] Export formats approved (CSV + HTML/MD)

---

## 🚀 READY TO BUILD

**Next Action:** Start setting up React project structure

**Estimated completion:** Working prototype in 5-6 days

**Let's code! 💪**


