# Seams & Status Style Guide

## 🎨 Design Philosophy

**Mobile-First, App-Like Experience**
- Native mobile app feel with professional desktop scaling
- Touch-optimized interactions with proper spacing
- Consistent visual hierarchy and component patterns

## 📱 Layout Patterns

### Mobile Header
```css
.mobileHeader {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
  gap: var(--space-6);
  padding: 0;
}
```

### Desktop Grid Layout
```css
.desktopGrid {
  display: block;
}

@media (min-width: 1024px) {
  .desktopGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
  }
}
```

## 🎯 Component Patterns

### Overview Cards
**Structure**: Header + Stats Grid/Flex
**Mobile**: Single column, stacked
**Desktop**: 3-column grid

```css
.overviewCard {
  background: var(--neutral-0);
  border-radius: var(--radius-2xl);
  padding: var(--space-4); /* Mobile */
  box-shadow: var(--shadow-md);
  border: 1px solid var(--neutral-100);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Desktop */
@media (min-width: 1024px) {
  .overviewCard {
    padding: var(--space-5);
  }
}
```

### Card Stats Layout
**Default**: 2-column grid
**Revenue Card**: Flex column (vertical stack)

```css
.cardStats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.revenueCard .cardStats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```

### Quick Action Buttons
**Mobile**: Horizontal layout with icon + text
**Desktop**: Vertical list layout

```css
.actionButton {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--neutral-0);
  border: 1px solid var(--neutral-100);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.actionIcon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-0);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;
  z-index: 1;
  position: relative;
}
```

## 🎨 Color Themes

### Primary Actions
```css
.primaryButton {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  color: var(--neutral-0);
  border: none;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}
```

### Card Color Themes
```css
/* Orders - Blue */
.ordersCard {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border-color: var(--primary-200);
}

/* Revenue - Green */
.revenueCard {
  background: linear-gradient(135deg, var(--success-50) 0%, var(--success-100) 100%);
  border-color: var(--success-200);
}

/* Customers - Purple */
.customersCard {
  background: linear-gradient(135deg, var(--accent-purple) 5%, rgba(139, 92, 246, 0.1) 100%);
  border-color: rgba(139, 92, 246, 0.3);
}
```

## 🌙 Dark Mode Patterns

### Card Backgrounds
```css
[data-theme="dark"] .overviewCard {
  background: var(--neutral-800);
  border-color: var(--neutral-700);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
```

### Action Buttons
```css
[data-theme="dark"] .actionButton {
  background: var(--neutral-800);
  border-color: var(--neutral-700);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .actionIcon {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  color: var(--neutral-0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
```

## 📏 Spacing Scale

### Component Padding
- **Mobile Cards**: `var(--space-4)`
- **Desktop Cards**: `var(--space-5)`
- **Large Desktop**: `var(--space-5)` (consistent)

### Grid Gaps
- **Mobile**: `var(--space-3)`
- **Desktop**: `var(--space-4)` to `var(--space-6)`
- **Section Margins**: `var(--space-6)` to `var(--space-8)`

## 🔄 Responsive Breakpoints

### Mobile (320px - 767px)
- Single column layouts
- Touch-optimized spacing
- Compact card padding

### Tablet (768px - 1023px)
- 2-column grids where appropriate
- Intermediate spacing
- Balanced mobile/desktop approach

### Desktop (1024px+)
- Multi-column layouts
- Enhanced hover effects
- Larger typography and spacing

### Large Desktop (1440px+)
- Optimized proportions
- Enhanced visual effects
- Maximum content width

## 🎭 Interactive States

### Hover Effects
```css
.overviewCard:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-2xl);
}

.actionButton:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-200);
}

.actionButton:hover .actionIcon {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}
```

### Active States
```css
.overviewCard:active {
  transform: scale(0.98);
}

.actionButton:active {
  transform: scale(0.96);
}
```

## 📝 Typography

### Section Titles
```css
.sectionTitle {
  font-size: var(--text-base); /* Mobile */
  font-weight: var(--font-bold);
  color: var(--neutral-900);
  margin-bottom: var(--space-4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (min-width: 1024px) {
  .sectionTitle {
    font-size: var(--text-xl);
    margin-bottom: var(--space-6);
  }
}
```

### Stat Numbers
```css
.statNumber {
  font-size: var(--text-xl); /* Mobile */
  font-weight: var(--font-black);
  color: var(--neutral-900);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-1);
}

@media (min-width: 1024px) {
  .statNumber {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }
}
```

## 🎨 Visual Effects

### Gradients
- **Primary**: `linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)`
- **Success**: `linear-gradient(135deg, var(--success-50) 0%, var(--success-100) 100%)`
- **Purple**: `linear-gradient(135deg, var(--accent-purple) 5%, rgba(139, 92, 246, 0.1) 100%)`

### Shadows
- **Small**: `var(--shadow-sm)` - Subtle depth
- **Medium**: `var(--shadow-md)` - Standard cards
- **Large**: `var(--shadow-lg)` - Hover states
- **Extra Large**: `var(--shadow-2xl)` - Premium effects

### Border Radius
- **Small**: `var(--radius-lg)` - Icons
- **Medium**: `var(--radius-xl)` - Buttons
- **Large**: `var(--radius-2xl)` - Cards

## 🚀 Implementation Guidelines

### 1. Mobile-First Approach
- Start with mobile layout
- Scale up for larger screens
- Maintain touch-friendly targets

### 2. Consistent Spacing
- Use CSS variables for spacing
- Maintain visual rhythm
- Scale appropriately for screen size

### 3. Dark Mode Support
- Always include dark mode variants
- Test contrast ratios
- Maintain visual hierarchy

### 4. Interactive Feedback
- Provide hover and active states
- Use smooth transitions
- Ensure accessibility

### 5. Performance
- Use hardware-accelerated transforms
- Optimize for mobile performance
- Minimize layout shifts

## 📋 Component Checklist

When creating new components, ensure:

- [ ] Mobile-first responsive design
- [ ] Dark mode support
- [ ] Touch-friendly sizing
- [ ] Consistent spacing with CSS variables
- [ ] Smooth transitions and hover states
- [ ] Proper accessibility attributes
- [ ] Performance optimizations
- [ ] Visual hierarchy maintained
- [ ] Brand color consistency
- [ ] Typography scale adherence

---

*This style guide ensures consistent, professional, and mobile-optimized design across all Seams & Status pages.* 