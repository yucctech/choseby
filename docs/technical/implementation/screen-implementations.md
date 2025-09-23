# Screen Implementation Guide - CHOSEBY Healthcare Decision Platform

**Purpose**: Map component library to 26 wireframe screens for Claude Code implementation  
**Context**: UX-first development approach with responsive healthcare workflows  
**Priority**: Plan > Design > Implement - Revenue-critical screens first

---

## 🎯 **IMPLEMENTATION STRATEGY**

### **Phase 1: Revenue-Critical Screens (Week 2-3)**
**Target**: 6 screens that directly impact enterprise sales ($107-172/month pricing)

**Priority Order**:
1. **Screen 18**: Final Decision Selection (boardroom presentation moment)
2. **Screen 25**: Structured Discussion (team collaboration differentiator) 
3. **Screen 9**: Team Dashboard (leadership overview)
4. **Screen 14**: Consequence Summary (consensus validation)
5. **Screen 22**: Implementation Monitoring (executive dashboard)
6. **Screen 26**: Conflict Resolution (healthcare safety critical)

### **Phase 2: Core Workflow Screens (Week 3-4)**
**Target**: 12 screens for complete DECIDE methodology

### **Phase 3: Supporting Screens (Week 4-5)**
**Target**: Remaining 8 screens for complete platform

---

## 📱 **RESPONSIVE SCREEN IMPLEMENTATIONS**

### **Screen 18: Final Decision Selection** 
**Business Impact**: Enterprise sales moment - must support boardroom presentations

**Component Mapping**:
```typescript
// Desktop Layout (1200px+) - Boardroom Presentation
<ScreenLayout variant="desktop-three-column">
  <Sidebar>
    <DecisionProgressBar variant="desktop" currentPhase={5} />
    <TeamPresenceIndicator showDetailed={true} />
  </Sidebar>
  <MainContent>
    <AlternativeComparisonCard viewMode="presentation" />
    <AnonymousEvaluationCard variant="summary" />
  </MainContent>
  <ActionPanel>
    <ConflictIndicator expanded={true} />
    <DecisionAuditTrail complianceLevel="board-ready" />
  </ActionPanel>
</ScreenLayout>

// Tablet Layout (768-1024px) - Team Meeting
<ScreenLayout variant="tablet-two-column">
  <MainArea>
    <DecisionProgressBar variant="tablet" />
    <AlternativeComparisonCard viewMode="comparison" />
    <AnonymousEvaluationCard variant="interactive" />
  </MainArea>
  <SidePanel>
    <TeamPresenceIndicator />
    <ConflictIndicator />
  </SidePanel>
</ScreenLayout>

// Mobile Layout (320-414px) - Individual Review
<ScreenLayout variant="mobile-single-column">
  <DecisionProgressBar variant="mobile" />
  <AlternativeComparisonCard viewMode="individual" />
  <AnonymousEvaluationCard variant="mobile" />
  <ConflictIndicator compact={true} />
</ScreenLayout>
```

**API Integration**:
```yaml
GET /decisions/{id}/final-recommendation:
  response:
    recommendedAlternative: Alternative
    supportingData: EvaluationSummary
    consensusLevel: number
    presentationAssets: PresentationData

POST /decisions/{id}/finalize:
  requestBody:
    selectedAlternativeId: string
    confidenceLevel: string
    implementationNotes: string
```

**State Management**:
```typescript
interface Screen18State {
  recommendation: Alternative;
  evaluationSummary: EvaluationSummary;
  consensusData: ConsensusData;
  conflictStatus: ConflictStatus;
  presentationMode: boolean;
}
```

---

### **Screen 25: Structured Discussion Interface**
**Business Impact**: Core team collaboration differentiator

**Component Mapping**:
```typescript
// Desktop Layout - Facilitated Meeting Room
<ScreenLayout variant="desktop-meeting-room">
  <FacilitatorPanel>
    <TeamPresenceIndicator role="facilitator" />
    <ConflictIndicator detailed={true} />
    <DiscussionControls />
  </FacilitatorPanel>
  <DiscussionArea>
    <LiveDiscussionFeed />
    <AnonymousEvaluationCard variant="live-input" />
  </DiscussionArea>
  <ParticipantPanel>
    <TeamPresenceIndicator role="participant" />
    <ConflictResolutionTools />
  </ParticipantPanel>
</ScreenLayout>

// Tablet Layout - Collaborative Interface  
<ScreenLayout variant="tablet-collaborative">
  <DiscussionHeader>
    <DecisionProgressBar variant="tablet" />
    <TeamPresenceIndicator compact={true} />
  </DiscussionHeader>
  <MainDiscussion>
    <LiveDiscussionFeed />
    <AnonymousEvaluationCard variant="tablet" />
  </MainDiscussion>
  <ActionBar>
    <ConflictIndicator />
    <DiscussionControls />
  </ActionBar>
</ScreenLayout>
```

**API Integration**:
```yaml
WebSocket /discussions/{sessionId}/live:
  events:
    - participant_message
    - anonymous_input_submitted  
    - conflict_level_changed
    - consensus_updated

POST /discussions/start:
  requestBody:
    decisionId: string
    facilitatorId: string
    participantIds: string[]
    discussionType: 'structured' | 'open' | 'emergency'
```

---

### **Screen 9: Team Dashboard**  
**Business Impact**: Leadership overview for enterprise adoption

**Component Mapping**:
```typescript
// Desktop Layout - Executive Dashboard
<ScreenLayout variant="desktop-dashboard">
  <HeaderSection>
    <DecisionProgressBar variant="desktop-overview" />
    <TeamPresenceIndicator variant="executive" />
  </HeaderSection>
  <MetricsGrid>
    <DecisionMetricsCard />
    <ConflictIndicator variant="dashboard" />
    <TeamPerformanceCard />
    <ComplianceStatusCard />
  </MetricsGrid>
  <DetailSection>
    <AlternativeComparisonCard viewMode="dashboard" />
    <DecisionAuditTrail variant="summary" />
  </DetailSection>
</ScreenLayout>
```

---

## 🔧 **COMPONENT-TO-SCREEN MAPPING MATRIX**

| Component | Screens Used | Variants Needed | Priority |
|-----------|--------------|-----------------|----------|
| DecisionProgressBar | 1-26 (all) | mobile, tablet, desktop, compact | 🔴 Critical |
| AnonymousEvaluationCard | 4,5,8,12,16,18,25 | mobile, tablet, desktop, live | 🔴 Critical |
| ConflictIndicator | 14,18,22,24,25,26 | compact, detailed, dashboard | 🟡 High |
| TeamPresenceIndicator | 9,18,22,25,26 | compact, detailed, facilitator | 🟡 High |
| AlternativeComparisonCard | 10,16,18 | comparison, individual, presentation | 🟢 Medium |
| DecisionAuditTrail | 9,22,23,26 | summary, detailed, compliance | 🟢 Medium |

---

## 📋 **IMPLEMENTATION CHECKLIST FOR CLAUDE CODE**

### **Phase 1: Core Components (Week 2)**
- [ ] **DecisionProgressBar** with 4 responsive variants
- [ ] **AnonymousEvaluationCard** with anonymous session management
- [ ] **ConflictIndicator** with real-time WebSocket integration

### **Phase 2: Revenue-Critical Screens (Week 3)**  
- [ ] **Screen 18** with boardroom presentation layout
- [ ] **Screen 25** with live discussion interface
- [ ] **Screen 9** with executive dashboard view

### **Phase 3: Complete Implementation (Week 4)**
- [ ] Remaining 20 screens with responsive layouts
- [ ] Performance optimization (<2s load times)
- [ ] HIPAA compliance verification

---

## 🚀 **NEXT: RESPONSIVE DESIGN SYSTEM**

**Status**: Screen implementation guide complete  
**Next Task**: Create responsive design system with breakpoint specifications  
**Goal**: Enable Claude Code to build components with consistent healthcare UX across all devices

