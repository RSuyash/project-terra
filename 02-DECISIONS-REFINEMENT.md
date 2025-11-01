# Critical Decision: MVP Scope

## The Reality Check

You need this deployed **ASAP**, but your requirements are **everything**.

**We can't build everything in 48 hours.**

---

## Proposed MVP (Deployable: 3-4 Days)

### ✅ IN MVP (Essential for semester work)

#### Core Vegetation Plotting
- [x] Single plot entry form
- [x] Species add/search (local database)
- [x] Tree measurements (GBH, DBH, height, canopy)
- [x] Ground cover percentages (shrub, herb, grass, bare, rock, litter)
- [x] Disturbance indicators (checkboxes)
- [x] GPS capture (lat/lng + accuracy)
- [x] Plot metadata (observers, date, notes)

#### Species-Area Curve (Basic)
- [x] Fixed nested plot sizes: 5×5m, 10×10m, 20×20m, 40×40m
- [x] Cumulative species tracking
- [x] Auto-plot generation (S vs Area)
- [x] Power law fitting (simple linear regression)
- [x] Display c and z parameters

#### Biodiversity Analytics (Core 4 indices)
- [x] Shannon-Wiener Index (H')
- [x] Simpson's Index (D and 1-D)
- [x] Species Richness (S)
- [x] Pielou's Evenness (J)
- [ ] Other indices → V1

#### Data Management
- [x] IndexedDB storage (offline)
- [x] CSV export
- [x] Local species database with autocomplete
- [x] Data validation

#### UI/UX
- [x] Mobile-responsive design
- [x] Dark mode
- [x] High contrast (harsh conditions)
- [x] Large touch targets
- [x] Offline indicator
- [x] Simple navigation

#### Deployment
- [x] Deploy to Vercel
- [x] PWA capable
- [x] Service worker

---

### ❌ NOT IN MVP (Defer to V1/V2)

#### Advanced Plot Types
- [ ] Transects
- [ ] Grid surveys
- [ ] Variable nested plot sizes
- [ ] Multiple site comparisons

#### Advanced Analysis
- [ ] Menhinick's Index
- [ ] Margalef's Index
- [ ] All other diversity indices
- [ ] Temporal comparisons
- [ ] Advanced curve fitting models
- [ ] Statistical tests

#### Canopy Photo Analysis (ADDED TO MVP)
- [x] **Canopy photo capture** (4 angles: center + each quadrant)
- [x] **Photo storage/management** (IndexedDB)
- [x] **Auto photo analysis** (canopy percentage calculation)
- [x] **Photo merging** (combine 4 photos for accuracy)
- [x] **Data output** (canopy coverage metrics)

#### Advanced Features
- [ ] Excel export (CSV only in MVP)
- [ ] PDF reports (HTML-only in MVP)
- [ ] Cloud sync/collaboration
- [ ] GIS mapping
- [ ] Bird surveys
- [ ] Water quality
- [ ] Soil sampling
- [ ] Carbon calculator

#### Integration
- [ ] Global species database API
- [ ] eBird integration
- [ ] PlantNet integration
- [ ] Darwin Core export
- [ ] EML export

---

## Alternative: Ultra-Minimal MVP (Deployable: 1-2 Days)

**If you need something working tomorrow:**

### Version A: Vegetation Plotting Only
- Just plot entry + species
- Basic CSV export
- No analytics, no curves
- Add everything else later

### Version B: Analytics Only
- Data import from CSV
- Biodiversity index calculator
- Simple charts
- No field entry

**Question:** Do you want the full MVP (3-4 days) or ultra-minimal (1-2 days)?

---

## My Strong Recommendation

**Go with the FULL MVP above.**

**Timeline (Updated with Canopy Photos):**
- **Day 1:** React setup + vegetation plot form
- **Day 2:** Species-area curve + biodiversity engine
- **Day 3:** Canopy photo capture + analysis system
- **Day 4:** Polish, validation, testing
- **Day 5:** Deploy to Vercel
- **Day 6:** Buffer for complexity

**This gives you:**
- ✅ Working field data collection
- ✅ Immediate biodiversity insights
- ✅ Species-area analysis
- ✅ Canopy photo analysis (4 photos, merge, percentage)
- ✅ Deployed and usable

**Then iterate based on:**
- Real usage feedback
- Semester requirements
- Specific pain points

---

## Your Approval Needed

**Check all that apply:**

- [x] **Approved:** Full MVP scope above (with canopy photos)
- [x] **Approved:** 5-6 day timeline (realistic with canopy feature)
- [x] **Approved:** React + PWA architecture
- [x] **Approved:** Launch with canopy photo analysis
- [ ] **Changes needed:** None - READY TO BUILD

**What you can still add before starting:**
- Preferred color scheme
- Brand name refinement
- Any must-have specific features
- Any critical workflow needs

---

## After Approval: We Build

**Step 1:** Set up project structure  
**Step 2:** Build core data models  
**Step 3:** Implement vegetation plotting  
**Step 4:** Add species-area curve  
**Step 5:** Build biodiversity engine  
**Step 6:** Deploy and test  


