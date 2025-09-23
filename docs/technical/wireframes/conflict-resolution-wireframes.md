# Conflict Resolution Wireframes - Healthcare Decision Platform

**Focus**: Advanced Conflict Resolution Workflow  
**Screens**: 24-26 (Expert-validated conflict resolution)  
**Critical Feature**: Required by expert validation - 8.2/10 score dependent on this workflow

---

## Screen 24: Conflict Resolution - Discussion Interface

### 📱 Mobile Layout (320-414px)
```
┌─────────────────────────────────┐
│ ← [Back] Structured Discussion  │
│                                 │
│ 💬 Team Conflict Resolution    │
│                                 │
│ Option 2: New Protocol          │
│ Implementation Cost Disagreement │
│                                 │
│ Discussion Facilitator:         │
│ 👩‍⚕️ Nurse Johnson (Selected)   │
│                                 │
│ Anonymous Discussion Points:    │
│ ┌─────────────────────────────┐ │
│ │ 💭 "Hidden training costs   │ │
│ │    not considered"          │ │
│ │    Proposed by: Clinical    │ │
│ │    [Discuss] [Address]      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 💭 "Budget timeline issues" │ │
│ │    Proposed by: Admin       │ │
│ │    [Discuss] [Address]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Resolution Progress:            │
│ ████████░░ 80% Complete        │
│                                 │
│ [Add Point] [Propose Compromise]│
└─────────────────────────────────┘
```

### 📱 Tablet Layout (768-1024px)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← [Back] Conflict Resolution: Implementation Cost Disagreement              │
│                                                                             │
│ ┌─── Discussion Management ─────────────┐ ┌─── Team Status ─────────────────┐ │
│ │ 💬 FACILITATED DISCUSSION             │ │ 👥 REAL-TIME PARTICIPATION      │ │
│ │                                        │ │                                  │ │
│ │ Conflict: Implementation Cost          │ │ Facilitator: Nurse Johnson      │ │
│ │ Variance: 2.8 (Medium-High)          │ │ Status: 🟢 Active              │ │
│ │                                        │ │                                  │ │
│ │ Anonymous Discussion Points:           │ │ Team Members:                    │ │
│ │ ┌────────────────────────────────────┐ │ │ 🟢 Dr. Smith (Present)          │ │
│ │ │ 💭 "Hidden training costs not     │ │ │ 🟢 Dr. Williams (Present)       │ │
│ │ │    considered in initial estimate" │ │ │ 🟢 Dr. Martinez (Present)       │ │
│ │ │ Category: Financial Planning       │ │ │ 🟢 Nurse Thompson (Present)     │ │
│ │ │ Priority: High • Responses: 3     │ │ │ 🟢 Admin Chen (Present)         │ │
│ │ │ [Discuss] [Address] [Archive]     │ │ │ 🟡 Dr. Patel (Away)             │ │
│ │ └────────────────────────────────────┘ │ │ 🟡 Supervisor Davis (Away)      │ │
│ │ ┌────────────────────────────────────┐ │ │                                  │ │
│ │ │ 💭 "Budget timeline conflicts with │ │ │ Progress: 80% Complete          │ │
│ │ │    fiscal year planning cycles"   │ │ │ ████████████████░░░░ 80%        │ │
│ │ │ Category: Timeline Management      │ │ │                                  │ │
│ │ │ Priority: Medium • Responses: 5   │ │ │ Discussion Points: 3 active     │ │
│ │ │ [Discuss] [Address] [Archive]     │ │ │ Compromises proposed: 1         │ │
│ │ └────────────────────────────────────┘ │ │ Expected resolution: 15 min     │ │
│ │                                        │ │                                  │ │
│ │ [+ Add Discussion Point]              │ │ [Send Reminders] [End Session]  │ │
│ └────────────────────────────────────────┘ └──────────────────────────────────┘ │
│                                                                             │
│ [Propose Compromise] [Call Vote] [Schedule Follow-up] →                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🖥️ Desktop Layout (1200px+)
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← [Dashboard] Advanced Conflict Resolution: Implementation Cost Disagreement          [Analytics] [Export] [Archive Session] │
│                                                                                                                                   │
│ ┌─── Facilitated Discussion Thread ────────────────────┐ ┌─── Conflict Analytics ──────────┐ ┌─── Resolution Tools ─────────┐ │
│ │ 💬 STRUCTURED CONFLICT RESOLUTION                     │ │ 📊 DISAGREEMENT ANALYSIS        │ │ 🛠️ FACILITATION DASHBOARD     │ │
│ │                                                        │ │                                  │ │                               │ │
│ │ Primary Issue: Implementation Cost Variance (2.8)     │ │ 🎯 Root Cause Analysis:         │ │ 🎲 Available Strategies:      │ │
│ │ Facilitator: Nurse Johnson (Certified Mediator)      │ │ • Budget estimation gaps (40%)   │ │ • Guided compromise builder   │ │
│ │                                                        │ │ • Timeline pressure (35%)       │ │ • Anonymous re-evaluation     │ │
│ │ Discussion Points (Anonymous & Categorized):          │ │ • Scope creep concerns (25%)    │ │ • Expert consultation         │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │                                  │ │ • Facilitated negotiation     │ │
│ │ │ 💭 HIGH PRIORITY: "Hidden training costs not      │ │ │ 👥 Position Distribution:       │ │                               │ │
│ │ │    considered in initial $45K estimate"           │ │ │ Conservative (>$50K): 3 members │ │ 📋 Session Management:        │ │
│ │ │ Category: Financial Planning                       │ │ │ Moderate ($40-50K): 3 members   │ │ • Duration: 47 minutes        │ │
│ │ │ Submitted by: [Clinical Role] • Responses: 3       │ │ │ Optimistic (<$40K): 2 members   │ │ • Points discussed: 3/5       │ │
│ │ │ Status: Under Discussion                           │ │ │                                  │ │ • Consensus building: 80%     │ │
│ │ │ [View Responses] [Facilitate] [Mark Resolved]     │ │ │ 🧠 Behavioral Patterns:         │ │ • Next checkpoint: 13 min     │ │
│ │ └────────────────────────────────────────────────────┘ │ │ • Risk aversion driving caution │ │                               │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │ • Past budget overruns factor   │ │ 💡 AI Recommendations:        │ │
│ │ │ 💭 MEDIUM: "Budget timeline conflicts with fiscal │ │ │ • Innovation pressure present   │ │ "Focus discussion on shared   │ │
│ │ │    year planning and approval cycles"             │ │ │                                  │ │ commitment to patient safety  │ │
│ │ │ Category: Timeline Management                      │ │ │ 📈 Resolution Probability:      │ │ while addressing legitimate   │ │
│ │ │ Submitted by: [Administrative] • Responses: 5      │ │ │ Current path success: 72%       │ │ budget concerns through phased │ │
│ │ │ Status: Actively Discussing                        │ │ │ With compromise: 91%            │ │ implementation approach."      │ │
│ │ │ [View Responses] [Facilitate] [Mark Resolved]     │ │ │ Timeline estimate: 18 minutes   │ │                               │ │
│ │ └────────────────────────────────────────────────────┘ │ │                                  │ │ [Generate Compromise]         │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │ 🎯 Success Factors:             │ │ [Schedule Team Vote]          │ │
│ │ │ 💭 LOW: "Staff resistance to change may increase  │ │ │ • Strong facilitator present    │ │ [Request External Expert]     │ │
│ │ │    implementation complexity and cost"            │ │ │ • Anonymous discussion working  │ │ [Export Session Data]         │ │
│ │ │ Category: Change Management                        │ │ │ • Common ground identified      │ │                               │ │
│ │ │ Submitted by: [Clinical Role] • Responses: 2       │ │ │ • Team engagement high (85%)    │ │                               │ │
│ │ │ Status: Pending Discussion                         │ │ │                                  │ │                               │ │
│ │ │ [View Responses] [Facilitate] [Mark Resolved]     │ │ │                                  │ │                               │ │
│ │ └────────────────────────────────────────────────────┘ │ │                                  │ │                               │ │
│ └────────────────────────────────────────────────────────┘ └──────────────────────────────────┘ └───────────────────────────────┘ │
│                                                                                                                                   │
│ [+ Add Discussion Point] [Propose Comprehensive Compromise] [Call Formal Vote] [Schedule Follow-up Session] →                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Components**: Facilitated discussion, anonymous points, real-time presence, progress tracking  
**API Integration**: GET /conflicts/{id}/discussion, POST /conflicts/{id}/discussion/points  
**Navigation**: → Screen 25 (Compromise Proposal)

---

## Screen 25: Conflict Resolution - Compromise Proposal

### 📱 Mobile Layout (320-414px)
```
┌─────────────────────────────────┐
│ ← [Back] Propose Compromise     │
│                                 │
│ 🤝 Compromise Solution         │
│                                 │
│ Original Option: New Protocol   │
│ Cost Estimate: $45,000         │
│ Timeline: 12 weeks             │
│                                 │
│ Proposed Modifications:         │
│ ┌─────────────────────────────┐ │
│ │ 💰 Cost: $32,000 (-$13K)   │ │
│ │ ⏰ Timeline: 16 weeks (+4)  │ │
│ │ 📋 Pilot phase added        │ │
│ │ 🛡️ Risk controls enhanced   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Impact on Scores:               │
│ Implementation Cost: 4→6 (+2)   │
│ Staff Training: 6→7 (+1)       │
│ Timeline Risk: 3→5 (+2)        │
│                                 │
│ Consensus Prediction: 85% ✅    │
│                                 │
│ [Submit for Review] [Modify]   │
└─────────────────────────────────┘
```

### 📱 Tablet Layout (768-1024px)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← [Back] Compromise Proposal Generator                                      │
│                                                                             │
│ ┌─── Compromise Details ───────────────┐ ┌─── Impact Analysis ─────────────┐ │
│ │ 🤝 PHASED IMPLEMENTATION PROPOSAL    │ │ 📊 STAKEHOLDER SATISFACTION     │ │
│ │                                      │ │                                  │ │
│ │ Core Changes:                        │ │ Conservative Members:            │ │
│ │ 💰 Reduced cost: $32K (-29%)        │ │ ✅ Budget concerns addressed     │ │
│ │ ⏰ Extended timeline: 16 weeks       │ │ ✅ Risk mitigation included      │ │
│ │ 📋 Pilot phase: 4 weeks first       │ │ Satisfaction: 78% ███████████░   │ │
│ │ 🛡️ Enhanced controls added          │ │                                  │ │
│ │                                      │ │ Moderate Members:                │ │
│ │ Implementation Phases:               │ │ ✅ Balanced approach             │ │
│ │ Phase 1: Pilot (4w, $8K)           │ │ ✅ Reasonable timeline           │ │
│ │ Phase 2: Rollout (12w, $24K)       │ │ Satisfaction: 89% ██████████████ │ │
│ │                                      │ │                                  │ │
│ │ Risk Mitigation:                     │ │ Aggressive Members:              │ │
│ │ • Monthly budget reviews            │ │ ⚠️ Timeline extended             │ │
│ │ • Staff feedback loops              │ │ ✅ Innovation maintained         │ │
│ │ • Progress checkpoints              │ │ Satisfaction: 68% ██████████░░░  │ │
│ │                                      │ │                                  │ │
│ │ Expected Outcomes:                   │ │ 🎯 Overall Prediction:           │ │
│ │ • Cost variance reduced 65%         │ │ Team Approval: 85% ██████████████│ │
│ │ • Timeline confidence +40%          │ │ Implementation Success: 91%      │ │
│ └──────────────────────────────────────┘ └──────────────────────────────────┘ │
│                                                                             │
│ [Submit to Team] [Generate Alternatives] [Schedule Vote] →                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🖥️ Desktop Layout (1200px+)
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← [Dashboard] Advanced Compromise Generator                                                [AI Assist] [Templates] [Export] │
│                                                                                                                                   │
│ ┌─── Comprehensive Compromise Solution ─────────────────────┐ ┌─── Impact Modeling ──────────┐ ┌─── Success Prediction ─────┐ │
│ │ 🤝 ADAPTIVE PHASED IMPLEMENTATION PROPOSAL               │ │ 📊 STAKEHOLDER ANALYSIS      │ │ 📈 OUTCOME FORECASTING     │ │
│ │                                                           │ │                               │ │                             │ │
│ │ Solution Title: "Budget-Conscious Phased Protocol Rollout" │ │ Conservative Group (3):       │ │ 🎯 Success Probability:     │ │
│ │                                                           │ │ Current: 35% satisfaction     │ │ ████████████████████ 91%   │ │
│ │ 🔄 Core Innovation: Flexible cost/timeline balance       │ │ With compromise: 78%         │ │                             │ │
│ │                                                           │ │ Key gains:                    │ │ 📊 Risk Assessment:         │ │
│ │ Financial Framework:                                      │ │ • 29% cost reduction         │ │ Budget overrun: 15% ███░    │ │
│ │ Original budget: $45,000                                 │ │ • Pilot safety net           │ │ Timeline delay: 22% ████░   │ │
│ │ Proposed budget: $32,000 (-$13,000, -29%)              │ │ • Enhanced monitoring        │ │ Scope creep: 18% ███░░     │ │
│ │ Phase 1 (Pilot): $8,000 (4 weeks)                      │ │                               │ │ Quality issues: 12% ██░░    │ │
│ │ Phase 2 (Rollout): $24,000 (12 weeks)                  │ │ Moderate Group (3):          │ │                             │ │
│ │                                                           │ │ Current: 68% satisfaction     │ │ 💰 Financial Impact:        │ │
│ │ Timeline Adjustment:                                      │ │ With compromise: 89%         │ │ Cost savings: $13,000      │ │
│ │ Original: 12 weeks                                       │ │ Why they approve:             │ │ ROI improvement: +18%       │ │
│ │ Proposed: 16 weeks (+4 weeks, +33%)                     │ │ • Balanced risk/reward        │ │ Budget confidence: 94%      │ │
│ │ Pilot validation: 4 weeks                                │ │ • Evidence-based approach     │ │                             │ │
│ │ Full implementation: 12 weeks                            │ │ • Professional compromise     │ │ 📅 Timeline Confidence:     │ │
│ │                                                           │ │                               │ │ On-schedule: 78%           │ │
│ │ Enhanced Risk Controls:                                   │ │ Aggressive Group (2):        │ │ Within 2 weeks: 94%        │ │
│ │ • Weekly pilot progress reviews                          │ │ Current: 45% satisfaction     │ │ Major delays: 6% risk      │ │
│ │ • Monthly budget tracking and alerts                     │ │ With compromise: 68%         │ │                             │ │
│ │ • Staff feedback integration loops                       │ │ Concerns addressed:           │ │ 🧠 Team Psychology:         │ │
│ │ • Go/no-go decision gates                               │ │ • Core innovation preserved   │ │ Cohesion boost: +35%       │ │
│ │ • Immediate escalation protocols                         │ │ • Timeline still reasonable   │ │ Trust building: +42%        │ │
│ │                                                           │ │ • Creates precedent model    │ │ Future decisions: +28%      │ │
│ └───────────────────────────────────────────────────────────┘ └───────────────────────────────┘ └─────────────────────────────┘ │
│                                                                                                                                   │
│ [Submit Comprehensive Proposal] [Generate Alternative Versions] [Schedule Team Vote] [Export Analysis] →                       │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Components**: Compromise modification interface, impact visualization, consensus prediction  
**API Integration**: POST /conflicts/{id}/compromise, PUT /decisions/{id}/options/{option_id}  
**Navigation**: → Screen 26 (Final Consensus)

---

## Screen 26: Conflict Resolution - Final Consensus
```
┌─────────────────────────────────┐
│ ← [Back] Consensus Results      │
│                                 │
│ ✅ Conflict Successfully Resolved│
│                                 │
│ Modified Option: New Protocol   │
│ (Phased Implementation)         │
│                                 │
│ Final Team Consensus: 92% ✅    │
│ Improvement: +27% from conflict │
│                                 │
│ Resolution Summary:             │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Changes Made:            │ │
│ │ • Cost reduced to $32,000   │ │
│ │ • Timeline extended to 16wk │ │
│ │ • Added progress checkpoints│ │
│ │                             │ │
│ │ 👥 Team Agreement:          │ │
│ │ • All concerns addressed    │ │
│ │ • Compromise accepted       │ │
│ │ • Implementation approved   │ │
│ │                             │ │
│ │ ⏱️ Resolution Time: 45 mins │ │
│ │ 💬 Discussion Points: 8     │ │
│ │ 🤝 Compromises Made: 3      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Next Steps:                     │
│ ✅ Decision ready for Phase 5   │
│ ✅ Action plan development      │
│ ✅ Team alignment achieved      │
│                                 │
│ [Continue to Action Planning]  │
│ [Generate Resolution Report]   │
│ [Return to Dashboard]          │
└─────────────────────────────────┘
```

**Components**: Resolution success confirmation, consensus metrics, process summary, next phase controls  
**API Integration**: PUT /conflicts/{id}/resolved, GET /decisions/{id}/consensus-final  
**Navigation**: → Phase 5 (Action Planning) or dashboard

---

## Implementation Notes

**Critical for Expert Validation**: These 3 screens address the key feedback about missing conflict resolution workflow.

**Healthcare Context**: Facilitates professional disagreement resolution while maintaining anonymity and documentation for compliance.