# Environmental Science Software Suite - Discovery Questions

## Project Overview
Building a comprehensive field data collection and analysis suite for environmental science practicals and research.

---

## Category 1: Context & Users

### Q1: Who are the primary users of this software?
**Options:**
- [ ] Just you (personal use)
- [x] Your classmates/staff members
- [x] Open-source community / other students
- [x] Professional field researchers

**Why this matters:** Determines authentication, user management, and sharing features.

---

### Q2: What devices will this primarily run on?
**Options:**
- [ ] Laptops (Windows/Mac)
- [ ] Tablets (iPad, Android)
- [ ] Smartphones (primary mobile usage)
- [x] Mixed use (all devices)

**Why this matters:** Critical for UI/UX design and feature prioritization (mobile-first vs desktop-first).

---

### Q3: What's your current typical field setup?
**Answer:** Currently none, but other 2nd year, super seniors, and field working professionals might have, I might later collect the information about it.

**Why this matters:** Determines offline capability requirements, GPS accuracy needs, and deployment strategy.

---

## Category 2: Technical Preferences

### Q4: What's your proficiency level with:
- **JavaScript:** [ ] Beginner [ ] Intermediate [ ] Advanced
- **React:** [ ] Never used [ ] Basic [ ] Comfortable
- **Web development:** [ ] New [ ] Some experience [ ] Experienced
- **Databases:** [ ] Basic [ ] Intermediate [ ] Advanced
  
  ALL OF THIS WILL BE DONE BY CLI AI TOOLS AND CURSOR AND SHIT< SO NO NEED TO WORRY ABOUT THIS

**Why this matters:** Determines complexity level and learning curve tolerance.

---

### Q5: What's your time availability?
**Answer:** [ ] 2-3 hours per day [ ] 5-10 hours per week [ ] Can dedicate full days [ ] Sporadic

  ALL OF THIS WILL BE DONE BY CLI AI TOOLS AND CURSOR AND SHIT< SO NO NEED TO WORRY ABOUT THIS
  
  
**Why this matters:** Affects development timeline and feature scope.

---

### Q6: Do you have a preferred hosting solution or domain?
**Options:**
- [ ] GitHub Pages (free, simple)
- [x] Netlify/Vercel (PWA ready)
- [ ] University hosting
- [x] Your own server/VPS
- [ ] Don't care yet
      
NETLIFY VERSEL ETC FOR PRIMARY TESTING< ONCE IT IS APPROVED OR LIKE LIT BIT FUNDED BY THE DEPARTMENT THEN WE CAN MOVE TO VPS

**Why this matters:** Influences deployment complexity and service worker strategy.

---

## Category 3: Functional Requirements - Vegetation Module

### Q7: What's your current data collection process?
**Answer:**

Pen and paper, then transfer to sheets, then analyze the data via python, also like canopy photos taken, which are like rectang;e from the middle of the plot as well as middle of each quadrant


**Why this matters:** Identifies gaps and pain points to solve.

---

### Q8: In your vegetation plots, do you typically:
- [ ] Survey single plots in isolation
- [x] Do nested plots (multiple sizes per location)
- [ ] Do transects (multiple plots along a line)
- [x] Do grid surveys (multiple plots in a grid)
We could be doing all of this as well, actually in future all is needed

**Why this matters:** Determines data structure and navigation flow.

---

### Q9: How many species typically per plot?
**Range:** [ ] 1-5 [ ] 5-15 [ ] 15-30 [ ] 30+

I think searchable nice list is better also scrollable option integrated as well in nicely defined catagories because it can have 5 to 30 species, cant say anythign speficicwally
**Why this matters:** Affects UI design (simple list vs searchable dropdown).

---

### Q10: Do you have a predefined species list or do you add new ones as you go?
**Answer:**
Currently add as we go, but finding a solution if we could use some globle datrabase conected to to globally available data but due to budget constrains we might not get access or could get if somehing is done

**Why this matters:** Determines species database structure and autocomplete features.

---

### Q11: What units do you use for tree measurements?
**Examples:** GBH in cm, DBH in cm, height in m, etc.

**Answer:**
Yeah right, still the SI units shouldalways be an option along with whatever else is taken
**Why this matters:** Ensures proper validation and export formatting.

---

## Category 4: Data Management

### Q12: How do you currently store/share field data?
**Answer:** [ ] Excel [ ] Google Sheets [ ] Paper forms [ ] Other: _____
Google Sheets (CSV)

**Why this matters:** Determines import/export priorities and data migration path.

---

### Q13: Do you need real-time collaboration (multiple people collecting data simultaneously)?
**Options:** [ ] Yes, critical [ ] Nice to have [ ] No, individual use
Nice to have

**Why this matters:** Determines backend architecture (Firebase vs local-only).

---

### Q14: What happens to data after collection?
**Check all that apply:**
- [x] Analyze immediately in the field
- [x] Export for Excel/R analysis
- [ ] Upload to cloud database
- [x] Generate reports
- [x] Share with supervisor/peers


**Why this matters:** Prioritizes export formats and analysis features.

---

## Category 5: Field Conditions & Constraints

### Q15: What's your internet connectivity in the field?
**Options:** [ ] None (offline only) [ ] Sporadic (3G/4G) [ ] Usually good (WiFi/LTE) [ ] Always connected

None to Very Good, offline is needed 
**Why this matters:** Critical for offline-first architecture decision.

---

### Q16: How long are typical field sessions?
**Answer:** [ ] 1-2 hours [ ] Half day [ ] Full day [ ] Multi-day
Few Hours to Full day and some can last multidays 

**Why this matters:** Determines battery optimization and data persistence needs.

---

### Q17: Are you working in harsh conditions?
**Check all:**
- [x] Rain/humidity exposure
- [x] Direct sunlight (screen visibility issues)
- [x] Dust/dirt
- [x] Rough terrain
- [x] Temperature extremes
Infact All
**Why this matters:** Affects UI design (high contrast, large buttons) and device protection considerations.

---

## Category 6: Biodiversity Calculations

### Q18: Which diversity indices are actually required for your practicals?
**Check all that apply:**
- [x] Shannon-Wiener (H')
- [x] Simpson's Index (D or 1-D)
- [x] Species Richness (S)
- [x] Evenness (Pielou's J)
- [x] Menhinick's Index
- [x] Margalef's Index
- [ ] Other:  ALL OTHER AVAILABLE MY DEAR_____

**Why this matters:** Prioritizes development and ensures accuracy.

---

### Q19: Do you need visualizations in the field or only in analysis?
**Options:** [ ] Both [ ] Analysis only [ ] Field only
Both

**Why this matters:** Determines chart library choice and rendering performance needs.

---

## Category 7: Species-Area Curve Specific

### Q20: Are nested plots always the same sizes or variable?
**Answer:**
Variable
**Why this matters:** Determines flexibility in plot size configuration.

---

### Q21: How do you handle species overlap in nested plots?
**Answer:** [ ] Cumulative unique species [ ] Per-plot distinct counts [ ] Other: _____
All that is possible my dear

**Why this matters:** Affects algorithm complexity.

---

### Q22: Do you need to compare multiple species-area curves?
**Options:** [ ] Single curve per session [ ] Compare across habitats [ ] Temporal comparisons
YESSS, need ALLLLL

**Why this matters:** Determines visualization and comparison features.

---

## Category 8: Deployment & Maintenance

### Q23: Do you need to deploy this semester or can you iterate?
**Timeline:** [ ] ASAP (next week) [ ] End of semester [ ] Ongoing project

RIGHT NOW, ASAPPPP

**Why this matters:** Affects MVP scope and feature prioritization.

---

### Q24: Will you maintain/update this long-term?
**Options:** [ ] One semester use [ ] 1-2 years [ ] Long-term open source
Long-term open source

**Why this matters:** Influences code quality, documentation, and architecture decisions.

---

## Category 9: Design & UX

### Q25: What existing apps do you love for field work?
**Examples:** iNaturalist, Survey123, QGIS, etc.
**Answer:**

**Why this matters:** Provides design inspiration and familiar patterns.

---

### Q26: Do you prefer:
**UI Style:**
- [x] Minimalist, clean forms
- [ ] Rich, colorful interface
- [x] Dark mode optimized
- [ ] Bright, high-contrast
- [ ] Don't care



**Why this matters:** Guides CSS framework and color palette selection.

---

## Category 10: Compliance & Standards

### Q27: Are there specific data standards you must follow?
**Answer:** [ ] Darwin Core [ ] Ecological Metadata Language [ ] Custom [ ] None

ALL and CUSTOM as well as with standard models 

**Why this matters:** Ensures proper data modeling and export formats.

---

### Q28: Any regulatory/privacy requirements?
**Answer:**

All basics, which will project my control over this open source project, meaning that if I even want to close source it, I must be able to do

**Why this matters:** Affects data encryption, GDPR compliance, etc.

---

## Next Steps
**Please answer all questions above, then we'll refine the technical specification and begin building.**

---

## Responses

*(Space for your answers below)*



