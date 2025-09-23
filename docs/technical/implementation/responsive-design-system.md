# Responsive Design System - CHOSEBY Healthcare Decision Platform

**Purpose**: Device-optimized design specifications for healthcare workflows  
**Context**: Extends validated wireframes with responsive layouts for mobile/tablet/desktop  
**Foundation**: Based on approved design system in `design-system-approved.md` and expert-validated wireframes

## 🎨 **DESIGN SYSTEM FOUNDATION**

### **Validated Design Language** (from existing design-system-approved.md):
- **Interface Style**: Card-based layout with clean typography
- **Color Strategy**: Professional healthcare/business colors with trust indicators  
- **Animation Approach**: Subtle transitions, team progress indicators
- **Spacing System**: Consistent 8px grid system
- **Accessibility**: WCAG 2.1 AA compliance for healthcare environments

---

## 🏥 **HEALTHCARE DEVICE CONTEXT STRATEGY**

### **Device Usage Patterns in Healthcare**
- **Mobile (320-414px)**: Emergency decisions, hallway consultations, individual input
- **Tablet (768-1024px)**: Patient bedside, clinical rounds, departmental meetings  
- **Desktop (1200px+)**: Boardroom presentations, leadership meetings, detailed analysis

### **Context-Driven Design Principles**
- **Speed over features** on mobile (emergency contexts)
- **Touch-friendly collaboration** on tablet (clinical environments)
- **Information density** on desktop (decision-making meetings)

---

## 📱 **RESPONSIVE BREAKPOINT SYSTEM**

### **Breakpoint Definitions**
```typescript
const Breakpoints = {
  mobile: {
    min: '320px',
    max: '767px',
    context: 'emergency_individual',
    priority: 'speed_simplicity'
  },
  tablet: {
    min: '768px', 
    max: '1199px',
    context: 'clinical_collaborative',
    priority: 'touch_professional'
  },
  desktop: {
    min: '1200px',
    max: 'unlimited',
    context: 'boardroom_leadership', 
    priority: 'information_presentation'
  }
}
```

### **Tailwind CSS Configuration**
```javascript
// tailwind.config.js for healthcare responsive design
module.exports = {
  theme: {
    screens: {
      'mobile': '320px',
      'tablet': '768px', 
      'desktop': '1200px',
      'presentation': '1440px' // For board presentations
    },
    extend: {
      spacing: {
        'touch-target': '44px', // Healthcare accessibility standard
        'emergency': '16px',    // Emergency decision spacing
        'clinical': '24px',     // Clinical workflow spacing
        'boardroom': '32px'     // Leadership meeting spacing
      }
    }
  }
}
```

---

## 🧩 **COMPONENT RESPONSIVE BEHAVIORS**

### **DecisionProgressBar**
```typescript
// Mobile: Horizontal scroll, numbers only
const MobileProgressBar = `
  flex overflow-x-auto space-x-2 p-4
  scrollbar-hide touch-pan-x
`;

// Tablet: Full width, abbreviated labels
const TabletProgressBar = `
  grid grid-cols-6 gap-4 p-6
  touch-friendly hover:scale-105
`;

// Desktop: Full labels, sidebar option
const DesktopProgressBar = `
  flex justify-between items-center p-8
  text-lg font-medium hover:shadow-lg
`;

interface ProgressBarResponsive {
  mobile: {
    layout: 'horizontal-scroll';
    labels: 'numbers-only';
    spacing: 'emergency'; 
  };
  tablet: {
    layout: 'grid-6-columns';
    labels: 'abbreviated';
    spacing: 'clinical';
  };
  desktop: {
    layout: 'full-width-flex';
    labels: 'complete';
    spacing: 'boardroom';
  };
}
```

### **AnonymousEvaluationCard**
```typescript
// Mobile: Single question focus, large touch targets
const MobileEvaluation = `
  w-full p-emergency space-y-4
  touch-target-44 text-lg
  focus:ring-4 focus:ring-blue-500
`;

// Tablet: Side-by-side comparison mode
const TabletEvaluation = `
  grid grid-cols-2 gap-clinical p-clinical
  touch-target-44 hover:shadow-md
  professional-appearance
`;

// Desktop: Multi-question view, detailed feedback
const DesktopEvaluation = `
  grid grid-cols-3 gap-boardroom p-boardroom
  detailed-feedback rich-interactions
  presentation-ready
`;
```

### **ConflictIndicator**
```typescript
// Responsive conflict visualization
const ConflictResponsive = {
  mobile: {
    display: 'compact-badge',
    interaction: 'tap-to-expand',
    detail: 'minimal-essential'
  },
  tablet: {
    display: 'inline-summary', 
    interaction: 'swipe-actions',
    detail: 'contextual-info'
  },
  desktop: {
    display: 'full-dashboard',
    interaction: 'hover-details',
    detail: 'comprehensive-analysis'
  }
}
```

---

## 🎨 **TYPOGRAPHY & HIERARCHY**

### **Healthcare-Appropriate Typography Scale**
```css
/* Emergency/Mobile - Clear, Large */
.text-emergency {
  @apply text-xl font-semibold leading-tight;
  /* 20px, readable under stress */
}

/* Clinical/Tablet - Professional, Balanced */  
.text-clinical {
  @apply text-lg font-medium leading-relaxed;
  /* 18px, professional appearance */
}

/* Leadership/Desktop - Detailed, Sophisticated */
.text-leadership {
  @apply text-base font-normal leading-normal;
  /* 16px, information density */
}

/* Data/Numbers - Always Prominent */
.text-data {
  @apply text-2xl font-bold tabular-nums;
  /* Critical numbers always standout */
}
```

### **Information Hierarchy by Device**
```typescript
const InformationHierarchy = {
  mobile: {
    primary: 'Current decision status',
    secondary: 'Next required action', 
    tertiary: 'Basic team info',
    hidden: 'Detailed history, advanced options'
  },
  tablet: {
    primary: 'Decision overview + team status',
    secondary: 'Current phase details',
    tertiary: 'Alternative comparisons',
    hidden: 'Full audit trails'
  },
  desktop: {
    primary: 'Complete decision dashboard',
    secondary: 'All team and progress data',
    tertiary: 'Historical context',
    hidden: 'Nothing - full information display'
  }
}
```

---

## 🔧 **INTERACTION PATTERNS**

### **Touch vs Mouse vs Keyboard**
```typescript
// Touch-first design for mobile/tablet
const TouchInteractions = {
  targetSize: '44px', // Healthcare accessibility standard
  spacing: '8px',     // Prevents accidental touches
  feedback: 'haptic + visual',
  gestures: ['tap', 'swipe', 'pinch']
};

// Mouse precision for desktop
const MouseInteractions = {
  hoverStates: 'subtle-elevation',
  clickTargets: 'smaller-precise', 
  feedback: 'visual-only',
  shortcuts: 'keyboard-supported'
};

// Emergency optimizations
const EmergencyInteractions = {
  mobile: 'large-buttons-minimal-steps',
  tablet: 'one-handed-operation',
  desktop: 'keyboard-shortcuts-speed'
};
```

### **Navigation Patterns by Device**
```typescript
const NavigationPatterns = {
  mobile: {
    pattern: 'bottom-tab-bar',
    primary: 'current-screen-focus',
    secondary: 'minimal-chrome'
  },
  tablet: {
    pattern: 'sidebar-collapse',
    primary: 'adaptive-two-pane',
    secondary: 'context-aware'
  },
  desktop: {
    pattern: 'persistent-sidebar',
    primary: 'three-pane-layout',
    secondary: 'full-navigation-tree'
  }
}
```

---

## 🎯 **HEALTHCARE COMPLIANCE RESPONSIVE DESIGN**

### **Accessibility Standards by Device**
```typescript
const AccessibilityStandards = {
  mobile: {
    minTouchTarget: '44px',
    colorContrast: 'WCAG AA+',
    textSize: 'minimum 18px',
    hapticFeedback: 'required'
  },
  tablet: {
    minTouchTarget: '44px', 
    colorContrast: 'WCAG AA+',
    textSize: 'minimum 16px',
    professionalAppearance: 'medical-grade'
  },
  desktop: {
    keyboardNavigation: 'full-support',
    colorContrast: 'WCAG AA+', 
    textSize: 'scalable',
    screenReader: 'optimized'
  }
}
```

### **HIPAA Compliance Visual Indicators**
```css
/* Anonymous mode indicators - consistent across devices */
.anonymous-indicator {
  @apply border-2 border-green-500 bg-green-50;
  /* Visual privacy confirmation */
}

/* Conflict alerts - severity-appropriate sizing */
.conflict-mobile { @apply p-2 text-sm; }
.conflict-tablet { @apply p-4 text-base; }
.conflict-desktop { @apply p-6 text-lg; }

/* Audit trail access - role-appropriate detail */
.audit-mobile { @apply hidden; /* Too complex for emergency use */ }
.audit-tablet { @apply block simplified; }
.audit-desktop { @apply block comprehensive; }
```

---

## 📐 **LAYOUT GRID SYSTEMS**

### **CSS Grid Specifications**
```css
/* Mobile: Single column, vertical flow */
.mobile-layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 16px;
  padding: 16px;
  /* Stack everything vertically */
}

/* Tablet: Adaptive two-column */
.tablet-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: 24px; 
  padding: 24px;
  /* Main content + sidebar */
}

/* Desktop: Three-column with flexible center */
.desktop-layout {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  grid-gap: 32px;
  padding: 32px;
  /* Sidebar + main + action panel */
}

/* Presentation mode for boardrooms */
.presentation-layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 48px;
  padding: 48px;
  font-size: 120%; /* Larger for projection */
}
```

---

## ⚡ **PERFORMANCE RESPONSIVE DESIGN**

### **Loading Strategies by Device**
```typescript
const LoadingStrategies = {
  mobile: {
    priority: 'critical-path-only',
    images: 'lazy-load-aggressive',
    components: 'code-split-screens',
    caching: 'offline-first'
  },
  tablet: {
    priority: 'progressive-enhancement', 
    images: 'responsive-sizes',
    components: 'route-based-splitting',
    caching: 'intelligent-prefetch'
  },
  desktop: {
    priority: 'full-feature-set',
    images: 'high-quality-preferred',
    components: 'component-based-splitting',
    caching: 'predictive-loading'
  }
}
```

### **Bundle Size Optimization**
```javascript
// Dynamic imports by device capability
const loadComponents = async (device) => {
  if (device === 'mobile') {
    return import('./components/MobileOptimized');
  } else if (device === 'tablet') {
    return import('./components/TabletEnhanced');
  } else {
    return import('./components/DesktopComplete');
  }
};
```

---

## 🔧 **IMPLEMENTATION GUIDELINES**

### **Development Priority**
1. **Mobile-first base** - Core functionality works on smallest screen
2. **Tablet enhancement** - Add collaborative features and professional styling
3. **Desktop optimization** - Full feature set with presentation capabilities

### **Testing Strategy**
```typescript
const ResponsiveTestMatrix = {
  mobile: ['iPhone SE', 'iPhone 12', 'Android Small'],
  tablet: ['iPad', 'Android Tablet', 'Surface Pro'],
  desktop: ['1280x720', '1920x1080', '2560x1440'],
  presentation: ['4K projector', 'conference room displays']
};
```

### **Performance Targets by Device**
- **Mobile**: <3s initial load on 3G, <500ms interactions
- **Tablet**: <2s initial load on WiFi, <300ms interactions  
- **Desktop**: <1s initial load on broadband, <200ms interactions

---

## 📋 **CLAUDE CODE IMPLEMENTATION CHECKLIST**

### **Phase 1: Foundation**
- [ ] Tailwind configuration with healthcare breakpoints
- [ ] Base component responsive variants
- [ ] Typography scale implementation

### **Phase 2: Component Adaptation**  
- [ ] DecisionProgressBar responsive behaviors
- [ ] AnonymousEvaluationCard device optimization
- [ ] ConflictIndicator responsive layouts

### **Phase 3: Layout Implementation**
- [ ] CSS Grid systems for all breakpoints
- [ ] Navigation patterns by device
- [ ] Performance optimization and testing

---

**STATUS**: Responsive design system complete  
**NEXT**: API Integration Mapping for UX-optimized endpoints  
**GOAL**: Enable Claude Code to build healthcare-optimized responsive components

