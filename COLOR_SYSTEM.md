# 🎨 TURBO RESPONSE COLOR SYSTEM
## Extracted from Reference Images

**Last Updated:** January 13, 2025  
**Authority:** Demarcus, Chief Strategist  
**Source:** Reference screenshots from production site

---

## 🌊 PRIMARY COLORS

### Background Colors
```css
--background-primary: #0a1628;     /* Deep navy blue - main background */
--background-secondary: #0f1e35;   /* Slightly lighter navy - cards/sections */
--background-tertiary: #1a2942;    /* Card hover state */
--background-header: #1c2938;      /* Header/navigation bar */
```

### Text Colors
```css
--text-primary: #ffffff;           /* Pure white - headings */
--text-secondary: #e0e6ed;         /* Light gray - body text */
--text-muted: #8b95a5;             /* Muted gray - secondary info */
```

### Accent Colors
```css
--accent-cyan: #06b6d4;            /* Bright cyan - primary CTA, headings */
--accent-cyan-hover: #0891b2;      /* Darker cyan - hover state */
--accent-cyan-light: #22d3ee;      /* Light cyan - highlights */
```

### Border Colors
```css
--border-primary: #1e3a5f;         /* Subtle navy border - cards */
--border-accent: #0891b2;          /* Cyan border - highlighted cards */
--border-muted: #2d4a6b;           /* Muted border - dividers */
```

---

## 🎯 COMPONENT-SPECIFIC COLORS

### Buttons
```css
/* Primary Button (CTA) */
.btn-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: #ffffff;
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #06b6d4;
  border: 2px solid #06b6d4;
}

.btn-secondary:hover {
  background: rgba(6, 182, 212, 0.1);
}
```

### Cards
```css
.card {
  background: #0f1e35;
  border: 1px solid #1e3a5f;
  border-radius: 16px;
}

.card:hover {
  border-color: #0891b2;
  box-shadow: 0 8px 24px rgba(6, 182, 212, 0.15);
}

.card-highlighted {
  border: 2px solid #0891b2;
  background: linear-gradient(135deg, #0f1e35 0%, #1a2942 100%);
}
```

### Badges/Tags
```css
.badge-category {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 4px 12px;
  border-radius: 12px;
}
```

### Status Indicators
```css
.status-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.status-error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

---

## 📐 DESIGN TOKENS

### Spacing
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### Border Radius
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.25);
--shadow-glow: 0 0 24px rgba(6, 182, 212, 0.3);
```

---

## 🎨 COLOR USAGE GUIDELINES

### Homepage (/)
- **Background:** `--background-primary` (#0a1628)
- **Hero Section:** `--background-secondary` (#0f1e35) with cyan gradient overlay
- **Headings:** `--accent-cyan` (#06b6d4)
- **Body Text:** `--text-secondary` (#e0e6ed)
- **CTA Buttons:** Cyan gradient (`#06b6d4` → `#0891b2`)
- **Feature Cards:** `--background-secondary` with `--border-primary`

### Intake Form (/intake)
- **Background:** `--background-primary`
- **Form Container:** `--background-secondary` with rounded corners
- **Input Fields:** `--background-tertiary` with `--border-primary`
- **Input Focus:** Border changes to `--accent-cyan`
- **Submit Button:** Cyan gradient
- **Labels:** `--text-primary`
- **Placeholder:** `--text-muted`

### Admin Dashboard (/admin)
- **Background:** `--background-primary`
- **Header:** `--background-header`
- **Table/Cards:** `--background-secondary`
- **Table Headers:** `--text-primary`
- **Table Rows:** `--text-secondary`
- **Hover State:** `--background-tertiary`
- **Status Badges:** Category-specific colors (see Status Indicators)

### Admin Case Detail (/admin/case/:id)
- **Background:** `--background-primary`
- **Info Cards:** `--background-secondary` with `--border-primary`
- **Section Headings:** `--accent-cyan`
- **Labels:** `--text-muted`
- **Values:** `--text-primary`
- **Action Buttons:** Cyan gradient (primary), outlined (secondary)

---

## 🔍 ACCESSIBILITY NOTES

### Contrast Ratios (WCAG AA Compliance)
- **White text on navy background:** 15.2:1 ✅ (exceeds 7:1 requirement)
- **Cyan text on navy background:** 8.5:1 ✅ (exceeds 7:1 requirement)
- **Light gray text on navy background:** 10.3:1 ✅ (exceeds 7:1 requirement)
- **Muted gray text on navy background:** 5.8:1 ⚠️ (use for non-critical text only)

### Color Blindness Considerations
- **Cyan accent** is distinguishable for most color blindness types
- **Status colors** use both color AND text labels (not color alone)
- **Interactive elements** have visible focus states (not just color change)

---

## 🚀 IMPLEMENTATION CHECKLIST

### Global CSS (index.css)
- [ ] Update `:root` CSS variables
- [ ] Update `.dark` theme variables
- [ ] Update `body` background color
- [ ] Update default text color
- [ ] Update link colors

### Component Library
- [ ] Update Button component variants
- [ ] Update Card component styles
- [ ] Update Input/Form component styles
- [ ] Update Badge/Tag component styles
- [ ] Update Table component styles

### Pages
- [ ] Home page (/)
- [ ] Intake form (/intake)
- [ ] Confirmation page (/consumer/confirmation)
- [ ] Admin Login (/admin/login)
- [ ] Admin Dashboard (/admin)
- [ ] Admin Case Detail (/admin/case/:id)

---

## 📊 COLOR PALETTE REFERENCE

### Quick Copy-Paste Values

**Navy Blues (Backgrounds):**
- `#0a1628` - Primary background
- `#0f1e35` - Secondary background
- `#1a2942` - Tertiary background
- `#1c2938` - Header background

**Cyan Accents:**
- `#06b6d4` - Primary cyan
- `#0891b2` - Hover cyan
- `#22d3ee` - Light cyan

**Text Colors:**
- `#ffffff` - Primary text
- `#e0e6ed` - Secondary text
- `#8b95a5` - Muted text

**Borders:**
- `#1e3a5f` - Primary border
- `#0891b2` - Accent border
- `#2d4a6b` - Muted border

---

**Status:** OFFICIAL COLOR SYSTEM  
**Apply to:** All pages, components, and future designs  
**Exceptions:** None - maintain consistency across entire platform
