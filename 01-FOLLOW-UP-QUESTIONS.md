# Follow-Up Questions

> Based on your initial responses

---

## Critical Clarifications Needed

### Q25a: Favorite Field Apps (MISSING)
**Your answer:** None yet, but interested in All such apps

**Please tell me:** What apps do you currently use or love for field work?
- Examples: iNaturalist, Survey123, QGIS, eBird, Merlin, Seek, etc.
- Or: None yet, but interested in X, Y, Z

**Why:** This gives us design inspiration and familiar UI patterns your users expect.

---

### Q29: MVP Scope Clarity
**Your requirements:**
- Deploy ASAP (RIGHT NOW!)
- Long-term open source
- Offline-first
- All plot types needed
- All biodiversity indices needed
- Multi-device support

**The Conflict:** You need EVERYTHING deployed ASAP, but that's impossible.

**Key Decision Needed:** What's the ABSOLUTE MINIMUM viable version that solves your immediate problem?

**Suggested MVP (deployable in 48 hours):**
- ✅ Single vegetation plot entry (not nested/transect/grid yet)
- ✅ Basic species add/search
- ✅ 4 core biodiversity indices (Shannon, Simpson, Richness, Evenness)
- ✅ Simple species-area curve (fixed sizes: 5x5, 10x10, 20x20, 40x40)
- ✅ CSV export
- ✅ Mobile-optimized UI
- ❌ All other indices (later)
- ❌ Grid surveys, transects (later)
- ❌ Canopy photos (later)
- ❌ Advanced comparisons (later)

**Your approval:** YES/NO to this MVP scope?
YES, but also add Canopy photos analysis, for canopy cover analysis 

---

### Q30: Canopy Photo Integration Priority
**You mentioned:** "Canopy photos taken, which are like rectangle from the middle of the plot as well as middle of each quadrant"

**Questions:**
1. What do you do with these photos currently? (Manual analysis, software, just archive?) - Photo analysis, merging the quadrants/ plot middle photos to create a proper canopy photo merged made using all these to reduce error, canopy percentage, and proper data output out of this
2. Is this needed in MVP or can wait for V1?
   I need this in MVP
3. Do you need auto-analysis or just storage?
   Auto analysis, and storage nicely

**My recommendation:** Move to V1 (not MVP) unless critical.

---

### Q31: Species Database Integration
**You said:** "Currently add as we go, but finding a solution if we could use some global database connected to globally available data but due to budget constraints we might not get access"

**Free Options Available:**
1. **GBIF API** (Global Biodiversity Information Facility) - FREE, no API key
2. **iNaturalist API** - FREE, public data
3. **CoL API** (Catalogue of Life) - FREE taxonomy
4. **Tropicos** - FREE botanical database (Missouri Botanical Garden)
5. **PlantNet API** - FREE for research (requires registration)
6. **TaxonWorks** - FREE open-source

**Question:** Should I integrate a free API from day one, or start with local-only and add later?
Just add this to documentation, we can add this in V2, for now not 

**My recommendation:** Start with local-only for MVP speed, add GBIF integration in V1.
Yes, add this in next version, for this current version I don't need it

---

### Q32: Data Ownership & Control
**Your requirement:** "All basics, which will protect my control over this open source project, meaning that if I even want to close source it, I must be able to do"

**Clarification:** Open source doesn't mean you lose control. You can:
- Use MIT/Apache license (permissive)
- Add copyright notice
- Maintain control as project maintainer
- Choose license type based on your goals

**Question:** What's your actual concern here?
- [x] Preventing others from using your code?
- [x] Preventing commercial use?
- [x] Ensuring attribution?
- [ ] Something else?

**My recommendation:** MIT License with your copyright. You keep control, others can use freely with attribution.

---

## Technical Decisions

### Q33: User Authentication Strategy
**Your users:** Classmates, staff, open-source community, professionals

**Question:** MVP authentication needs?
- [ ] None (anyone can use, no login)
- [x] Simple (optional user name/session)
- [x] Full (email/password, data tracking per user)
- [x] OAuth (Google/GitHub login)

**My recommendation:** None for MVP, add optional in V1.
None for MVP for sure, we can add this in V1

---

### Q34: Photo Storage Strategy
**For canopy photos (future):**

**Option A:** Local only (IndexedDB for thumbnails, file system for full)
**Option B:** Cloud storage (Firebase Storage, Supabase Storage)
**Option C:** Hybrid (local with cloud sync)

**Question:** Budget/preference?

**My recommendation:** Local-only for MVP, add cloud in V1 if needed.
Option B, but for now, you are right local storage is fine

---

### Q35: Report Generation Format
**You need:** "Generate reports"

**Questions:**
1. What format? (PDF, HTML, DOCX?)
2. What content? (Just data tables? Charts? Photos? Maps?)
3. Template-based or auto-generated?

**My recommendation:** Simple HTML report for MVP, PDF in V1.

.md and .html is perfect.

---

### Q36: Collaboration Implementation
**You said:** "Nice to have"

**Question:** Push to V2 or try in V1?

**My recommendation:** V2. Focus on individual use for MVP.

Okay, done.

---

### Q37: Transect & Grid Survey Support
**You said:** "We could be doing all of this as well, actually in future all is needed"

**Question:** MVP scope - support all plot types or just single plots?

**My recommendation:** Start with single + nested plots, add transect/grid in V1.

Fine, done.

---

## Architecture Decisions

### Q38: Framework Choice
**Your answers:**
- Mixed devices (mobile + desktop)
- Offline-first critical
- Harsh conditions
- ASAP deployment
- Long-term maintenance

**My Strong Recommendation:** **React + PWA**
- Better long-term maintainability (you want this open-source for years)
- Superior mobile experience
- Service workers for offline
- Component reusability
- Strong ecosystem

**Alternative:** Vanilla JS (faster MVP but harder to maintain)

**Question:** Accept React-based architecture?
accepted the react based architecture

---

### Q39: Styling Framework
**Your preference:** Minimalist, clean, dark mode

**Recommendation:** **Tailwind CSS** + dark mode
- Rapid styling
- Mobile-first built-in
- Dark mode support
- High performance
- Professional look

**Question:** Approved?
Approved.

---

### Q40: Database Layer
**Your needs:** Offline-first, species database, multi-session persistence

**Recommendation:** **IndexedDB + Dexie.js wrapper**
- Native browser storage
- Large capacity
- Reliable offline
- Dexie makes it easy

**Question:** Approved?
Is this db actually easily connectable to backend and frondend properly

---

## Deployment Decisions

### Q41: Domain & Branding
**Question:** Do you have a project name/domain preference?

**Options:**
- "Project Terra" (your current name)
- Domain suggestions: `ecofield.app`, `vegplot.io`, `fieldcollect.io`

**Recommendation:** Keep "Project Terra" for now, add custom domain later if funded.

Yes, right.

---

### Q42: Initial Deployment Target
**You said:** Netlify/Vercel for testing, VPS when funded

**Question:** Start with Vercel or Netlify?

**My recommendation:** **Vercel** (better DX, faster builds)

Done.

---

## Summary of Recommended Technical Stack

### Chosen Architecture: **Full PWA (React-based)**

```yaml
Frontend:
  - React 18+ with Vite
  - TypeScript (type safety)
  - Tailwind CSS + Dark mode
  - Zustand (state management)
  
Storage:
  - IndexedDB + Dexie.js
  - Local-only MVP (no backend)
  
Charts:
  - Recharts or Victory (React-native)
  
Offline:
  - Service Worker + Workbox
  
Deployment:
  - Vercel (MVP)
  - Docker-ready for VPS migration
  
Export:
  - Papa Parse (CSV)
  - jsPDF (future PDF reports)
  - XLSX (Excel)
```

**Question:** Approve this stack?

---

## Next Steps

1. ✅ Answer Q25a (favorite apps)
2. ✅ Approve MVP scope (Q29)
3. ✅ Approve tech stack (Q38-Q40)
4. ✅ License decision (Q32)

**Then we build!**


