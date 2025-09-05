# Kryver Component Library - Design System Specification

**Date**: September 4, 2025
**Status**: Phase 0 Week 1 - Ready for Development Implementation
**Framework**: Tailwind CSS + React Components for Next.js

## Design Tokens

### Color Palette
```css
/* Primary Brand Colors */
--color-primary-50: #eff6ff
--color-primary-500: #3b82f6  /* Primary blue */
--color-primary-600: #2563eb
--color-primary-700: #1d4ed8

/* Success/Completion */
--color-success-50: #f0fdf4
--color-success-500: #10b981
--color-success-600: #059669

/* Warning/In Progress */
--color-warning-50: #fffbeb
--color-warning-500: #f59e0b
--color-warning-600: #d97706

/* Error/Issues */
--color-error-500: #ef4444
--color-error-600: #dc2626

/* Neutral Grays */
--color-gray-50: #f8fafc
--color-gray-100: #f1f5f9
--color-gray-200: #e2e8f0
--color-gray-300: #cbd5e1
--color-gray-400: #94a3b8
--color-gray-500: #64748b
--color-gray-600: #475569
--color-gray-700: #334155
--color-gray-800: #1e293b
--color-gray-900: #0f172a
```

### Typography Scale
```css
/* Font Family */
font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif

/* Font Sizes */
--text-xs: 12px      /* Small labels, helper text */
--text-sm: 14px      /* Body text, form inputs */
--text-base: 16px    /* Default body text */
--text-lg: 18px      /* Emphasized text */
--text-xl: 20px      /* Small headings */
--text-2xl: 24px     /* Card titles */
--text-3xl: 30px     /* Page headings */
--text-4xl: 36px     /* Major headings */

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System (8px Grid)
```css
/* Tailwind spacing scale */
--space-1: 4px      /* px-1, py-1, m-1 */
--space-2: 8px      /* px-2, py-2, m-2 */
--space-3: 12px     /* px-3, py-3, m-3 */
--space-4: 16px     /* px-4, py-4, m-4 */
--space-6: 24px     /* px-6, py-6, m-6 */
--space-8: 32px     /* px-8, py-8, m-8 */
--space-12: 48px    /* px-12, py-12, m-12 */
--space-16: 64px    /* px-16, py-16, m-16 */
```

### Border Radius
```css
--radius-sm: 4px     /* rounded */
--radius-md: 6px     /* rounded-md */
--radius-lg: 8px     /* rounded-lg */
--radius-xl: 12px    /* rounded-xl */
--radius-full: 9999px /* rounded-full */
```

## Core Components

### 1. Button Component
**Tailwind Classes**:
```typescript
// Button variants
const buttonVariants = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
  success: "bg-green-500 hover:bg-green-600 text-white border-green-500",
  danger: "bg-red-500 hover:bg-red-600 text-white border-red-500"
}

// Button sizes
const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",  // Default
  lg: "px-6 py-3 text-base"
}

// Base classes
const baseButton = "inline-flex items-center justify-center font-medium border-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
```

**Implementation**:
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

### 2. Card Component
**Tailwind Classes**:
```css
/* Base card */
.card-base: bg-white border-2 border-gray-200 rounded-lg shadow-sm

/* Card variations */
.card-default: p-6 mb-5
.card-compact: p-4 mb-4
.card-highlight: border-blue-500 bg-blue-50

/* Card header */
.card-header: pb-4 mb-5 border-b border-gray-200 flex justify-between items-center

/* Card sections */
.card-content: space-y-4
.card-footer: pt-4 mt-6 border-t border-gray-200 flex justify-end gap-3
```

### 3. Form Elements

#### Input Field
**Tailwind Classes**:
```css
/* Base input */
.input-base: w-full border-2 border-gray-300 rounded-md px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none

/* Input variations */
.input-default: min-h-[44px]
.input-large: min-h-[120px] resize-y  /* For textarea */
.input-error: border-red-500 focus:border-red-500 focus:ring-red-200

/* Input states */
.input-disabled: bg-gray-100 text-gray-500 cursor-not-allowed
```

#### Select Dropdown
```css
.select-base: w-full border-2 border-gray-300 rounded-md px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white
```

#### Label
```css
.label-base: block text-sm font-medium text-gray-700 mb-2
.label-required: after:content-['*'] after:text-red-500 after:ml-1
```

### 4. Status Badge Component
**Tailwind Classes**:
```typescript
const badgeVariants = {
  active: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800", 
  pending: "bg-blue-100 text-blue-800",
  error: "bg-red-100 text-red-800"
}

const baseBadge = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
```

### 5. Progress Bar
```css
.progress-container: w-full bg-gray-200 rounded-full h-2 mb-4
.progress-fill: bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out
```

### 6. Navigation Components

#### Top Navigation
```css
.nav-container: bg-white border-b-2 border-gray-200 px-6 py-4
.nav-content: flex justify-between items-center max-w-7xl mx-auto
.nav-logo: text-2xl font-bold text-blue-500
.nav-links: hidden md:flex space-x-6
.nav-link: px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100
.nav-link-active: bg-blue-500 text-white
.nav-user: flex items-center space-x-3 px-4 py-2 rounded-full border border-gray-300 bg-gray-50
```

#### Sidebar
```css
.sidebar-container: w-72 bg-gray-50 border-r-2 border-gray-200 p-5
.sidebar-section: mb-6
.sidebar-header: text-sm font-semibold text-gray-900 mb-3
.sidebar-item: flex items-center p-3 rounded-md border border-gray-200 bg-white mb-2
```

### 7. Layout Components

#### Grid System
```css
/* Responsive grids using Tailwind */
.grid-1: grid grid-cols-1
.grid-2: grid grid-cols-1 md:grid-cols-2 gap-5
.grid-3: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5

/* Flex layouts */
.flex-between: flex justify-between items-center
.flex-center: flex justify-center items-center
.flex-start: flex justify-start items-center
```

#### Container
```css
.container-base: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
.container-narrow: max-w-4xl mx-auto px-4 sm:px-6 lg:px-8
.container-wide: max-w-full mx-auto px-4 sm:px-6 lg:px-8
```

## AI Integration Components

### 1. AI Suggestion Box
**Tailwind Classes**:
```css
.ai-suggestion: bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4 my-4
.ai-icon: inline-block w-5 h-5 bg-blue-500 rounded-full mr-2
.ai-header: flex items-center font-medium text-blue-900 mb-3
.ai-content: text-sm text-blue-800 mb-3
.ai-actions: flex gap-2
```

### 2. Smart Input Field
```css
.smart-input-container: relative
.smart-input: w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none
.smart-placeholder: absolute top-4 left-4 text-gray-500 pointer-events-none
.smart-processing: border-blue-400 bg-blue-50
```

### 3. Framework Generation Display
```css
.framework-container: space-y-4
.framework-item: flex justify-between items-center py-3 border-b border-gray-100
.framework-name: font-medium text-gray-900
.framework-weight: flex items-center gap-2
.weight-slider: w-20 h-1 bg-gray-300 rounded appearance-none
.weight-label: text-sm text-gray-600
```

## Responsive Breakpoints

### Mobile First Approach
```css
/* Mobile (default): 0-767px */
.mobile-stack: flex-col space-y-4
.mobile-full: w-full
.mobile-hide: hidden

/* Tablet: 768px-1023px */
@media (min-width: 768px) {
  .tablet-grid: md:grid-cols-2
  .tablet-flex: md:flex
  .tablet-show: md:block
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .desktop-grid: lg:grid-cols-3
  .desktop-sidebar: lg:w-80
  .desktop-main: lg:flex-1
}
```

### Component Responsive Behavior
- **Navigation**: Hamburger menu on mobile, full menu on desktop
- **Cards**: Single column on mobile, 2-3 columns on larger screens
- **Sidebar**: Overlay on mobile, fixed sidebar on desktop
- **Tables**: Horizontal scroll on mobile, full display on desktop
- **Forms**: Full width on mobile, structured layouts on desktop

## Animation & Transitions

### Micro-Interactions
```css
/* Smooth transitions */
.transition-colors: transition-colors duration-200 ease-in-out
.transition-transform: transition-transform duration-200 ease-in-out
.transition-all: transition-all duration-200 ease-in-out

/* Hover effects */
.hover-scale: hover:transform hover:scale-105
.hover-shadow: hover:shadow-md
.hover-lift: hover:-translate-y-1

/* Loading states */
.loading-pulse: animate-pulse
.loading-spin: animate-spin
```

### Focus States
```css
.focus-ring: focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
.focus-visible: focus-visible:ring-2 focus-visible:ring-blue-500
```

## Implementation Notes for Next.js

### 1. Tailwind Configuration
```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### 2. Component File Structure
```
/components
  /ui               # Base UI components
    Button.tsx
    Card.tsx
    Input.tsx
    Badge.tsx
  /layout           # Layout components
    Navigation.tsx
    Sidebar.tsx
    Container.tsx
  /forms            # Form-specific components
    DecisionInput.tsx
    CriteriaBuilder.tsx
    ScoreInput.tsx
  /ai               # AI-enhanced components
    SmartSuggestion.tsx
    FrameworkGenerator.tsx
    ProgressInsights.tsx
```

### 3. CSS Organization
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center font-medium border-2 rounded-md transition-colors focus:outline-none focus:ring-2;
  }
  
  .card {
    @apply bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 mb-5;
  }
  
  .input-field {
    @apply w-full border-2 border-gray-300 rounded-md px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none;
  }
}
```

## Accessibility Considerations

### WCAG 2.1 AA Compliance
- **Color Contrast**: All text meets 4.5:1 contrast ratio minimum
- **Focus Management**: Visible focus indicators on all interactive elements
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

### Implementation Requirements
```tsx
// Example accessible button
<button
  className="btn btn-primary"
  aria-label="Create new decision"
  disabled={isLoading}
  aria-describedby={isLoading ? "button-loading" : undefined}
>
  {isLoading ? (
    <>
      <span className="animate-spin mr-2">⟳</span>
      <span id="button-loading">Creating...</span>
    </>
  ) : (
    "Create Decision"
  )}
</button>

// Example accessible form
<div>
  <label htmlFor="decision-input" className="label-base label-required">
    Decision Description
  </label>
  <textarea
    id="decision-input"
    className="input-field input-large"
    aria-describedby="decision-help"
    required
  />
  <div id="decision-help" className="text-sm text-gray-600 mt-1">
    Describe what you need to decide in your own words
  </div>
</div>
```

## Testing Strategy

### Component Testing Checklist
- [ ] Visual regression testing for all components
- [ ] Responsive behavior across breakpoints
- [ ] Keyboard navigation functionality
- [ ] Screen reader compatibility
- [ ] Color contrast validation
- [ ] Loading and error states
- [ ] Form validation behavior

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Graceful Degradation**: Basic functionality in older browsers

## Performance Considerations

### CSS Optimization
- **Tailwind Purging**: Remove unused CSS classes in production
- **Critical CSS**: Inline critical path CSS for above-the-fold content
- **Component Lazy Loading**: Load non-critical components on demand

### Bundle Size Targets
- **Component Library**: <15KB gzipped
- **Individual Components**: <2KB gzipped average
- **Critical CSS**: <5KB inline

## Development Workflow

### Component Creation Process
1. **Design Review**: Confirm design matches wireframes
2. **Implementation**: Build with Tailwind + TypeScript
3. **Testing**: Accessibility, responsive, functionality tests
4. **Documentation**: Component props, usage examples
5. **Review**: Code review with design system adherence check

### Quality Gates
- [ ] TypeScript strict mode compliance
- [ ] Accessibility audit passed
- [ ] Responsive design verified
- [ ] Performance budget maintained
- [ ] Design system consistency confirmed

---

**Next Steps for Implementation**:
1. Set up Tailwind configuration with custom design tokens
2. Create base UI components (Button, Card, Input)
3. Build form components for decision input workflow
4. Implement AI suggestion components
5. Add responsive layout components
6. Create comprehensive component documentation

**Ready for Development Handoff**: September 4, 2025
**Technical Implementation Start**: Week 4 Phase 0 (September 25, 2025)