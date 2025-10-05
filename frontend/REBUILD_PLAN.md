# Frontend Rebuild Plan - Customer Response Platform

## ✅ COMPLETED (2025-10-03)

### 1. Backup & Clean Slate
- [x] Backed up healthcare frontend to `frontend-healthcare-backup/`
- [x] Created fresh `frontend/` directory
- [x] Installed Next.js 15 + React 18 + Tailwind + TypeScript
- [x] Copied reusable UI components (Button, Card, Input, Badge, Progress)
- [x] Copied reusable hooks (useResponsive)

### 2. Tech Stack Confirmed
- Next.js 15.5.3
- React 18.3.1
- TypeScript 5
- Tailwind CSS 3.4.13
- Heroicons 2.1.5
- Headless UI 2.1.8
- Framer Motion 11.11.11

---

## 🎯 NEXT STEPS

### Phase 1: Foundation (Today - Week 2 Tuesday)
- [ ] Create Next.js config files (next.config.ts, tsconfig.json, tailwind.config.ts)
- [ ] Create customer response TypeScript types (`src/types/index.ts`)
- [ ] Create API client for backend integration (`src/lib/api-client.ts`)
- [ ] Create basic app layout (`src/app/layout.tsx`, `src/app/page.tsx`)
- [ ] Create responsive layout components for customer response context

###Phase 2: Core Screens (Week 2 Wed-Fri, Week 3)
- [ ] Dashboard - Customer response metrics and active decisions
- [ ] Decision Creation - Customer context input form with AI classification
- [ ] Problem Definition - Customer issue framing
- [ ] Criteria Establishment - Response evaluation factors
- [ ] Consider Options - Response alternatives with AI recommendations
- [ ] Anonymous Evaluation - Team input collection
- [ ] Results Display - Consensus analysis and conflict detection
- [ ] Outcome Tracking - Customer satisfaction correlation

### Phase 3: Customer Response Features (Week 4)
- [ ] Customer tier/urgency/impact inputs
- [ ] AI classification display
- [ ] Stakeholder recommendation UI
- [ ] Response draft preview
- [ ] Real-time team collaboration indicators
- [ ] Mobile-optimized decision workflow

---

## 📋 TERMINOLOGY MAPPING (Healthcare → Customer Response)

| Healthcare (OLD) | Customer Response (NEW) |
|------------------|-------------------------|
| Patient | Customer |
| Clinical decision | Customer response decision |
| Treatment options | Response options |
| Medical criteria | Response criteria |
| Healthcare team | Customer-facing team |
| ICU/Department | Customer success/Support team |
| Clinical outcome | Customer satisfaction outcome |
| Diagnosis | Issue classification |
| Prognosis | Expected impact |
| Treatment plan | Response strategy |

---

## 🗂️ NEW FILE STRUCTURE

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (auth, theme)
│   │   ├── page.tsx                   # Landing/dashboard
│   │   ├── login/page.tsx            # Authentication
│   │   └── dashboard/
│   │       ├── page.tsx              # Customer response dashboard
│   │       ├── decisions/
│   │       │   ├── page.tsx          # Decision list
│   │       │   ├── [id]/page.tsx     # Decision detail
│   │       │   └── new/page.tsx      # Create decision
│   │       └── analytics/page.tsx    # Response analytics
│   ├── components/
│   │   ├── ui/                       # ✅ Generic components (from backup)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Progress.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── ResponsiveLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── screens/                  # Customer response screens (NEW)
│   │       ├── Dashboard.tsx
│   │       ├── DecisionCreation.tsx
│   │       ├── CustomerContextForm.tsx
│   │       ├── AIClassificationDisplay.tsx
│   │       ├── AnonymousEvaluation.tsx
│   │       ├── ResultsAnalysis.tsx
│   │       └── OutcomeTracking.tsx
│   ├── lib/
│   │   ├── api-client.ts            # Backend API integration
│   │   ├── auth.ts                  # JWT authentication
│   │   └── utils.ts                 # Utility functions
│   ├── hooks/                        # ✅ Reusable hooks (from backup)
│   │   └── useResponsive.ts
│   └── types/
│       └── index.ts                  # Customer response TypeScript types
├── public/
│   └── favicon.ico
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── package.json
```

---

## 🎨 DESIGN PRINCIPLES

### 1. Customer Response Focus
- All terminology reflects customer-facing team context
- Metrics focus on response time, customer satisfaction, team efficiency
- UI emphasizes urgency, customer tier, and relationship context

### 2. Mobile-First
- Primary use case: Urgent customer issues on mobile
- Touch-friendly interfaces
- Progressive disclosure for complex data

### 3. AI Integration
- AI classification prominent but not mandatory
- Confidence scores visible
- Human override always available

### 4. Team Collaboration
- Anonymous evaluation to prevent hierarchy bias
- Real-time status indicators
- Conflict detection highlighted

---

## ⏱️ ESTIMATED TIMELINE

- **Today (Week 2 Tuesday)**: Foundation setup (4 hours) ✅ IN PROGRESS
- **Week 2 Wed-Fri**: Core layout + first 2 screens (12 hours)
- **Week 3**: Remaining 6 screens (20 hours)
- **Week 4**: Polish + mobile optimization (20 hours)

**Total**: ~56 hours over 3 weeks

---

## 📊 SUCCESS CRITERIA

- ✅ Zero healthcare terminology in code
- ✅ All screens mobile-responsive
- ✅ TypeScript strict mode with no errors
- ✅ Backend API integration working
- ✅ AI classification integrated and tested
- ✅ Customer response workflow functional end-to-end

---

**Last Updated**: 2025-10-03
**Status**: Fresh rebuild in progress
