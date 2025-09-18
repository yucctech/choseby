# Core DECIDE Workflow - User Flow Documentation

**Role: Technical Lead + UX Designer**  
**Date**: September 18, 2025  
**Status**: Draft - Requires validation from UX/PM/Business experts

## Flow Overview: 6-Phase Healthcare Decision Process

### Entry Points
1. **New Decision Creation**: Team member creates decision from dashboard
   - **Decision Type Selection**: Simple (3-phase) vs Complex (6-phase) vs Emergency (bypass)
   - **Urgency Assessment**: Normal timeline vs Regulatory deadline vs Clinical emergency
2. **Invited to Existing Decision**: Team member receives email/notification to join decision
3. **Resume In-Progress Decision**: Team member returns to partially completed decision
4. **Emergency Decision Path**: Critical decisions with retrospective documentation

### Decision Type Routing (NEW)
```
Decision Creation
    ↓
[Urgency Assessment]
    ↓
IF Emergency → Emergency Decision Path (skip to implementation, document later)
IF Simple Decision → Streamlined 3-Phase Flow (Define → Evaluate → Implement)  
IF Complex Decision → Full 6-Phase DECIDE Flow
IF Regulatory Deadline → Standard flow with deadline tracking
```

### Master Flow: DECIDE Methodology Implementation

```
START: User Dashboard
    ↓
[Create New Decision] OR [Join Existing Decision] OR [Resume Decision]
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 1: DEFINE PROBLEM                                            │
├─────────────────────────────────────────────────────────────────────┤
│ Entry: Decision created → Auto-advance to Phase 1                  │
│ **NEW: First-time User Onboarding**                               │
│ • If first decision: Show guided tour of 6-phase process          │
│ • Progress indicator: "Phase 1 of 6" with visual timeline         │
│ • Contextual help: "Why we need to define the problem clearly"    │
│                                                                     │
│ User Actions:                                                       │
│ 1. Enter problem statement (50-500 chars)                         │
│    **NEW: Healthcare context validation**                          │
│    → System checks for clinical/administrative/compliance keywords │
│    → Suggests patient impact assessment if clinical terms detected │
│ 2. Identify stakeholders (2-10 people)                            │
│    → Select from team members                                       │
│    → Add external stakeholders (name/role only)                    │
│    **NEW: Role-based stakeholder suggestions**                     │
│    → System suggests clinical staff for clinical decisions         │
│    → Suggests compliance officer for regulatory decisions           │
│ 3. Define success criteria (1-5 criteria)                         │
│ 4. Set patient impact level (healthcare specific)                  │
│    **NEW: Regulatory deadline tracking**                           │
│    → Optional: Link to regulatory calendar                         │
│    → Auto-set timeline if compliance deadline detected             │
│                                                                     │
│ **NEW: Team Participation Enforcement**                           │
│ • Required team member acknowledgment of problem definition        │
│ • Escalation if key stakeholders don't respond within 48h         │
│ • Alternative: Assign delegate if stakeholder unavailable          │
│                                                                     │
│ Validation Rules:                                                   │
│ ✓ All required fields completed                                     │
│ ✓ Problem statement contains healthcare context                     │
│ ✓ At least 2 stakeholders selected                                 │
│                                                                     │
│ Decision Points:                                                    │
│ → Save Draft: Keep in Phase 1, allow return later                 │
│ → Submit for Review: Send to facilitator for approval              │
│ → Auto-advance: If no facilitator assigned, advance after 24h      │
│                                                                     │
│ Error States:                                                       │
│ ❌ Validation fails → Show specific field errors                   │
│ ❌ Team member removed → Reassign or continue without              │
│                                                                     │
│ Data Flowing Out:                                                   │
│ • Problem statement → Used in AI framework suggestion              │
│ • Stakeholder list → Used for Phase 4 evaluation assignments      │
│ • Success criteria → Used in Phase 6 monitoring setup             │
└─────────────────────────────────────────────────────────────────────┘
    ↓
[FACILITATOR APPROVAL] OR [AUTO-ADVANCE AFTER 24H]
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 2: ESTABLISH CRITERIA                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Entry: Phase 1 approved → All team members notified                │
│                                                                     │
│ User Actions:                                                       │
│ 1. AI Framework Suggestion (optional)                             │
│    → Submit problem description to DeepSeek R1                     │
│    → Review suggested criteria with confidence scores              │
│    → Accept/modify/reject suggestions                               │
│ 2. Manual Criteria Creation                                        │
│    → Add criteria (3-8 total)                                      │
│    → Set category (technical/financial/clinical/compliance)        │
│    → Assign weights (must sum to 100)                              │
│ 3. Team Review Process                                             │
│    → All team members can view/comment on criteria                 │
│    → Suggest modifications or additional criteria                   │
│                                                                     │
│ Validation Rules:                                                   │
│ ✓ 3-8 criteria defined                                             │
│ ✓ Weights sum exactly to 100                                       │
│ ✓ Each criterion has description (20-300 chars)                    │
│ ✓ Healthcare-specific criteria included for clinical decisions      │
│                                                                     │
│ Decision Points:                                                    │
│ → Use AI Suggestions: Accept DeepSeek R1 recommendations           │
│ → Modify AI Suggestions: Edit suggested criteria                    │
│ → Create Manually: Build criteria from scratch                     │
│ → Team Majority Approval: >50% team agreement to proceed           │
│ → Request Changes: Send back for modification                       │
│                                                                     │
│ Error States:                                                       │
│ ❌ AI model timeout → Fallback to manual creation                  │
│ ❌ Weight sum ≠ 100 → Real-time validation warning                 │
│ ❌ Team rejection → Return to criteria modification                 │
│                                                                     │
│ Data Flowing Out:                                                   │
│ • Criteria list → Used in Phase 4 evaluation matrix               │
│ • Weight assignments → Used in Phase 4 score calculations          │
│ • AI confidence scores → Stored for audit trail                    │
└─────────────────────────────────────────────────────────────────────┘
    ↓
[TEAM MAJORITY APPROVAL] (>50% team members)
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 3: CONSIDER OPTIONS                                          │
├─────────────────────────────────────────────────────────────────────┤
│ Entry: Criteria approved → Facilitator or admin adds options       │
│                                                                     │
│ User Actions:                                                       │
│ 1. Add Options (2-6 total)                                        │
│    → Option name (5-100 chars)                                     │
│    → Detailed description (50-500 chars)                           │
│    → Estimated cost (optional)                                     │
│    → Implementation timeline (optional)                             │
│    → Vendor/source information                                      │
│ 2. Feasibility Review                                              │
│    → Mark each option as feasible/not feasible                     │
│    → Add feasibility notes                                          │
│                                                                     │
│ Validation Rules:                                                   │
│ ✓ 2-6 options defined                                              │
│ ✓ Each option has name and description                             │
│ ✓ Feasibility reviewed for all options                             │
│                                                                     │
│ Decision Points:                                                    │
│ → Add More Options: If <6 options, can add more                    │
│ → Remove Infeasible Options: Filter out non-viable choices         │
│ → Proceed to Evaluation: Auto-advance when complete                │
│                                                                     │
│ Error States:                                                       │
│ ❌ All options marked infeasible → Return to option generation     │
│ ❌ Only 1 feasible option → Warning about limited choice           │
│                                                                     │
│ Data Flowing Out:                                                   │
│ • Options list → Used in Phase 4 evaluation matrix                │
│ • Cost estimates → Used in final ROI analysis                      │
│ • Feasibility flags → Filter evaluation options                    │
└─────────────────────────────────────────────────────────────────────┘
    ↓
[AUTO-ADVANCE] (No approval needed)
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 4: IDENTIFY BEST ALTERNATIVE (Anonymous Evaluation)          │
├─────────────────────────────────────────────────────────────────────┤
│ Entry: Options defined → All team members receive evaluation invite│
│ **NEW: Simplified Evaluation Interface**                          │
│ • Step-by-step evaluation: One criterion at a time                │
│ • Progress indicator: "Criterion 2 of 5" for each option         │
│ • Mobile-optimized: Touch-friendly sliders and inputs             │
│                                                                     │
│ User Actions:                                                       │
│ 1. **NEW: Guided Anonymous Scoring**                              │
│    → Step 1: Review all options and criteria                      │
│    → Step 2: Score Option A against all criteria                  │
│    → Step 3: Score Option B against all criteria                  │
│    → Step 4: Review and submit with overall confidence            │
│    → Provide rationale for extreme scores (1-2 or 9-10)           │
│    → Indicate confidence level (1-10) for each evaluation          │
│ 2. **NEW: Enhanced Progress Tracking**                            │
│    → See team completion status: "3 of 5 members completed"       │
│    → Receive reminders: 24h, 48h, 72h for incomplete evaluations  │
│    → **Participation Enforcement**: Escalate to manager after 96h │
│                                                                     │
│ **NEW: Improved Conflict Detection & Resolution**                 │
│ • Real-time variance calculation as scores submitted               │
│ • Immediate conflict alerts to facilitator                        │
│ • Anonymous discussion forum for high-variance criteria           │
│ • Option to schedule conflict resolution meeting                   │
│ • Re-evaluation window after conflict discussion                   │
│                                                                     │
│ **NEW: Participation Enforcement Rules**                          │
│ • Day 1-3: Gentle reminders via email/app notification            │
│ • Day 4-5: Escalate to team facilitator                          │
│ • Day 6-7: Escalate to manager with decision delay notification   │
│ • Timeout: Proceed with available evaluations (minimum 3 required)│
│ • Record non-participation in audit trail                         │
│                                                                     │
│ System Actions:                                                     │
│ • Conflict Detection Algorithm                                      │
│   → Calculate variance for each option-criterion combination        │
│   → Flag conflicts >2.5 standard deviations                        │
│   → Notify facilitator of significant disagreements                │
│ • Automatic Weighted Scoring                                       │
│   → Apply criterion weights to individual scores                   │
│   → Calculate team averages (excluding outliers if flagged)        │
│                                                                     │
│ Validation Rules:                                                   │
│ ✓ All option-criterion combinations scored                         │
│ ✓ Rationale provided for extreme scores                            │
│ ✓ Minimum 3 team member evaluations                                │
│                                                                     │
│ Decision Points:                                                    │
│ → Submit Individual Evaluation: Save anonymous scores              │
│ → Modify Scores: Change before final submission                     │
│ → Address Conflicts: If detected, facilitate discussion            │
│ → Timeout Advancement: Proceed after 7 days with available data    │
│ → Complete Evaluation: All members done OR timeout reached         │
│                                                                     │
│ Conflict Resolution Sub-flow:                                       │
│ IF conflicts detected:                                              │
│   1. Facilitator receives conflict notification                    │
│   2. Anonymous conflict discussion interface opens                 │
│   3. Team members can revise rationales                            │
│   4. Optional: Schedule discussion meeting                          │
│   5. Re-evaluation opportunity provided                             │
│   6. Proceed when conflicts <threshold OR timeout                   │
│                                                                     │
│ Error States:                                                       │
│ ❌ <3 team member evaluations at timeout → Proceed with warning    │
│ ❌ Persistent high conflicts → Escalate to manual resolution       │
│ ❌ Team member removed during evaluation → Continue without         │
│                                                                     │
│ Data Flowing Out:                                                   │
│ • Weighted scores → Final recommendation ranking                    │
│ • Conflict data → Decision quality metrics                         │
│ • Rationales → Professional documentation                          │
│ • Participation data → Team performance analytics                  │
└─────────────────────────────────────────────────────────────────────┘
    ↓
[ALL EVALUATIONS COMPLETE] OR [7-DAY TIMEOUT]
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 5: DEVELOP ACTION PLAN                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Entry: Evaluation complete → Results shown → Top option identified │
│ **NEW: Decision Override Protection**                              │
│ • If choosing non-recommended option: Mandatory justification form │
│ • Override rationale must be >200 characters                      │
│ • Override decision requires facilitator + manager approval        │
│ • Override recorded in audit trail with detailed reasoning         │
│                                                                     │
│ User Actions:                                                       │
│ 1. **Enhanced Implementation Planning**                            │
│    → Create detailed implementation plan (100-1000 chars)          │
│    → Define project timeline with milestones                       │
│    → **NEW: Regulatory timeline integration**                      │
│    → Link to compliance calendar for deadline tracking             │
│    → Identify required resources and budget                         │
│ 2. **Improved Responsibility Assignment**                          │
│    → Assign team members to implementation tasks                    │
│    → **NEW: Staff turnover protection**                           │
│    → Assign primary + backup responsible parties                   │
│    → Define handoff procedures if staff changes                    │
│    → Set task deadlines and dependencies                           │
│    → Define accountability measures                                 │
│ 3. **Enhanced Risk Assessment**                                    │
│    → Identify implementation risks                                  │
│    → Define mitigation strategies                                   │
│    → **NEW: Healthcare-specific risk categories**                  │
│    → Patient safety impact assessment                              │
│    → Regulatory compliance risk evaluation                         │
│                                                                     │
│ Validation Rules:                                                   │
│ ✓ Implementation plan >100 characters                              │
│ ✓ Timeline includes minimum 2 milestones                           │
│ ✓ At least 1 team member assigned as responsible                   │
│ ✓ All assignees confirmed as team members                          │
│                                                                     │
│ Decision Points:                                                    │
│ → Accept Recommended Option: Use top-scored option                 │
│ → Override Recommendation: Choose different option with rationale   │
│ → Request Re-evaluation: Return to Phase 4 if concerns             │
│ → Facilitator Approval: Required before advancing                  │
│                                                                     │
│ Error States:                                                       │
│ ❌ Assigned team member no longer available → Reassign             │
│ ❌ Implementation plan rejected → Revise and resubmit              │
│                                                                     │
│ Data Flowing Out:                                                   │
│ • Implementation plan → Project management integration             │
│ • Responsibility assignments → Task tracking systems               │
│ • Timeline → Calendar integration and reminders                    │
└─────────────────────────────────────────────────────────────────────┘
    ↓
[FACILITATOR APPROVAL]
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 6: EVALUATE AND MONITOR                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Entry: Action plan approved → Decision implementation begins        │
│                                                                     │
│ User Actions:                                                       │
│ 1. Success Metrics Definition                                      │
│    → Define 2-5 measurable success criteria                        │
│    → Set target values and timeframes                              │
│    → Identify data sources for measurement                          │
│ 2. Review Schedule Setup                                            │
│    → Schedule minimum 2 review meetings                            │
│    → Set review dates and participants                             │
│    → Define review agenda template                                  │
│ 3. Monitoring Dashboard Configuration                               │
│    → Select metrics to track automatically                         │
│    → Set up alerts for metric thresholds                           │
│                                                                     │
│ Validation Rules:                                                   │
│ ✓ 2-5 success metrics defined                                      │
│ ✓ All metrics are measurable (not subjective)                     │
│ ✓ Minimum 2 review dates scheduled                                 │
│ ✓ Review participants include decision stakeholders                │
│                                                                     │
│ Decision Points:                                                    │
│ → Complete Decision Process: Mark decision as complete              │
│ → Schedule Ongoing Monitoring: Set up recurring reviews            │
│ → Archive Decision: Move to completed decisions list               │
│                                                                     │
│ Error States:                                                       │
│ ❌ Unmeasurable metrics defined → Request revision                  │
│ ❌ Review participants unavailable → Reschedule                    │
│                                                                     │
│ Data Flowing Out:                                                   │
│ • Success metrics → Performance tracking dashboard                 │
│ • Review schedule → Calendar integration                           │
│ • Complete decision record → Audit trail and compliance            │
│ • Lessons learned → Organizational knowledge base                  │
└─────────────────────────────────────────────────────────────────────┘
    ↓
[DECISION COMPLETED] → Return to Dashboard with new completed decision
```

## Emergency Decision Path (NEW)

```
EMERGENCY DECISION ENTRY
    ↓
[Clinical Emergency Assessment]
• Life-threatening situation requiring immediate action
• Regulatory deadline <24 hours  
• System failure requiring immediate vendor switch
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ EMERGENCY DECISION WORKFLOW                                         │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Emergency Declaration                                            │
│    → Authorized by: Clinical Lead, Administrator, or CEO           │
│    → Emergency type: Clinical/Regulatory/Operational               │
│    → Expected timeline: <4 hours / <24 hours / <48 hours          │
│                                                                     │
│ 2. Rapid Team Assembly                                             │
│    → Auto-notify essential team members (max 3 people)            │
│    → 15-minute response window for acknowledgment                  │
│    → Proceed with available members if no response                 │
│                                                                     │
│ 3. Abbreviated Decision Process                                    │
│    → Problem statement (required, <100 characters)                │
│    → Available options (2-3 maximum)                              │
│    → Rapid evaluation: Single criterion focus (safety/compliance) │
│    → Verbal consensus required, documented immediately             │
│                                                                     │
│ 4. Immediate Implementation                                        │
│    → Action authorized immediately                                 │
│    → Implementation tracking begins                                │
│    → Communication to broader team                                 │
│                                                                     │
│ 5. Retrospective Documentation (within 48 hours)                  │
│    → Full DECIDE methodology applied retroactively                │
│    → Justification for emergency bypass                           │
│    → Lessons learned documentation                                 │
│    → Audit trail completion                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Express Mode for Simple Decisions (NEW)

```
SIMPLE DECISION ENTRY  
(Budget <$10K, Timeline <2 weeks, No regulatory impact)
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3-PHASE EXPRESS WORKFLOW                                           │
├─────────────────────────────────────────────────────────────────────┤
│ PHASE 1: DEFINE & EVALUATE (Combined)                             │
│ • Problem statement + 2-3 options                                 │
│ • Simple criteria (Cost, Quality, Timeline)                       │
│ • Team evaluation (24-hour window)                                │
│                                                                     │
│ PHASE 2: DECIDE & DOCUMENT                                        │  
│ • Results review + decision                                        │
│ • Basic implementation plan                                        │
│ • Responsibility assignment                                        │
│                                                                     │
│ PHASE 3: IMPLEMENT & MONITOR                                      │
│ • Action execution                                                 │
│ • Simple success tracking                                         │
│ • Completion documentation                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Exit Points and Handoffs

### Professional Documentation Generation
- **Trigger**: Any phase completion or final decision
- **Output**: PDF report with audit trail, team consensus, compliance documentation
- **Integration**: Healthcare compliance systems, board reporting tools

### Team Performance Analytics
- **Trigger**: Decision completion
- **Output**: Team collaboration metrics, decision quality scores, participation rates
- **Integration**: HR systems, team development programs

### Implementation Tracking
- **Trigger**: Phase 5 completion
- **Output**: Project timeline, responsibility matrix, success metrics
- **Integration**: Project management tools, calendar systems

## Critical Flow Considerations

### Healthcare-Specific Requirements
- Patient impact assessment required for clinical decisions
- HIPAA audit trail maintained throughout all phases
- Regulatory compliance checkpoints integrated
- Clinical terminology and workflows supported

### Anonymous Evaluation Protection
- No individual scores revealed during or after process
- Aggregate data only shown in results
- Conflict detection maintains anonymity
- Professional documentation excludes individual attribution

### Real-time Collaboration
- WebSocket updates for team progress
- Notification system for phase transitions
- Mobile-optimized for healthcare team accessibility
- Offline capability for areas with poor connectivity

---

**Status**: Draft user flow requiring expert validation
**Next**: Validation from UX Designer, Product Manager, and Healthcare Domain Expert perspectives