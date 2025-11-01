# Testing Guide - Project Terra

## 🚀 Dev Server Started!

**URL:** http://localhost:5173

**Open in browser to test!**

---

## ✅ What to Test

### 1. **Landing Page** ✓
- Beautiful 4-module dashboard
- Dark mode toggle (if implemented)
- Responsive layout

### 2. **Species Manager**
- Click "Add Species" button
- Add a test species (e.g., "Teak", scientific: "Tectona grandis")
- Search for species
- Verify it saves to IndexedDB

### 3. **Vegetation Plot Form**
- Fill in plot number, habitat, observers
- Click "Capture GPS" (requires location permission)
- Add ground cover percentages
- Mark disturbance indicators
- Add species measurements
- Save plot

### 4. **Database**
- Open browser DevTools → Application → IndexedDB
- Check "EcoFieldDatabase"
- Verify data is stored correctly

---

## 📱 Browser Requirements

- **Chrome/Edge/Brave:** Full support ✓
- **Firefox:** Full support ✓
- **Safari:** Limited support (may need polyfills)
- **Mobile:** Works but best on modern browsers

---

## 🐛 Known Issues

None yet! First test run.

---

## 📝 Test Checklist

- [ ] Page loads without errors
- [ ] Dark mode works
- [ ] Can add species
- [ ] Can search species
- [ ] GPS capture works (grant permission)
- [ ] Can add measurements
- [ ] Data saves to IndexedDB
- [ ] Mobile responsive (test on phone or dev tools)
- [ ] No console errors

---

**Report any issues you find!**


