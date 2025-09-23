# Team Collaboration Wireframes - Healthcare Decision Platform

**Focus**: Team Management, Real-time Collaboration, Analytics  
**Screens**: 9-14 (Team workflow support)  
**Healthcare Context**: Anonymous evaluation + role-based permissions + real-time presence

---

## Screen 9: Team Setup/Management
```
┌─────────────────────────────────┐
│ ← [Back] Team Management        │
│                                 │
│ 👥 ICU Leadership Team         │
│                                 │
│ Team Members (8/12 max):        │
│ ┌─────────────────────────────┐ │
│ │ 👨‍⚕️ Dr. Smith              │ │
│ │ ICU Medical Director        │ │
│ │ 🟢 Online • Admin           │ │
│ │ [Edit] [Remove]             │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👩‍⚕️ Nurse Johnson          │ │
│ │ Charge Nurse                │ │
│ │ 🟡 Away • Facilitator       │ │
│ │ [Edit] [Remove]             │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👨‍⚕️ Dr. Williams           │ │
│ │ Attending Physician         │ │
│ │ ⚫ Offline • Member          │ │
│ │ [Edit] [Remove]             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Team Roles:                     │
│ • Admin: Full team management   │
│ • Facilitator: Guide decisions  │
│ • Member: Participate in eval   │
│                                 │
│ [+ Invite Member]              │
│ [Team Settings]                │
└─────────────────────────────────┘
```

**Components**: Team member cards, healthcare roles, online status, role management  
**API Integration**: GET /teams/{team_id}/members, PUT /teams/{team_id}/members/{user_id}  
**Navigation**: → Screen 10 (Member Invitation)

---

## Screen 10: Team Member Invitation
```
┌─────────────────────────────────┐
│ ← [Back] Invite Team Member     │
│                                 │
│ 📧 Invite Healthcare Professional │
│                                 │
│ Email Address:                  │
│ ┌─────────────────────────────┐ │
│ │ doctor@hospital.org         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Healthcare Role:                │
│ ┌─────────────────────────────┐ │
│ │ ⚫ Physician                 │ │
│ │ ○ Nurse                     │ │
│ │ ○ Administrator             │ │
│ │ ○ Pharmacist                │ │
│ │ ○ Respiratory Therapist     │ │
│ │ ○ Other Clinical Staff      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Team Role:                      │
│ ○ Admin (Full management)       │
│ ⚫ Facilitator (Guide decisions) │
│ ○ Member (Participate only)     │
│                                 │
│ Personal Message (Optional):    │
│ ┌─────────────────────────────┐ │
│ │ Join our ICU team for       │ │
│ │ ventilator protocol review  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Send Invitation]              │
└─────────────────────────────────┘
```

**Components**: Email input, healthcare role selection, team role assignment, personal message  
**API Integration**: POST /teams/{team_id}/invitations  
**Navigation**: → Screen 9 (Team Management)

---

## Screen 11: Real-time Progress View
```
┌─────────────────────────────────┐
│ ← [Back] Decision Progress      │
│                                 │
│ 📊 Ventilator Protocol Review  │
│ Phase 4/6: Anonymous Evaluation │
│                                 │
│ Team Participation:             │
│ ┌─────────────────────────────┐ │
│ │ ✅ Dr. Smith (Complete)     │ │
│ │    Evaluated all options    │ │
│ │                             │ │
│ │ ✅ Nurse Johnson (Complete) │ │
│ │    Evaluated all options    │ │
│ │                             │ │
│ │ ⏳ Dr. Williams (In Prog.)  │ │
│ │    2/3 options evaluated    │ │
│ │                             │ │
│ │ ❌ Admin Brown (Pending)    │ │
│ │    0/3 options evaluated    │ │
│ │                             │ │
│ │ ⏳ Pharmacist (In Prog.)    │ │
│ │    1/3 options evaluated    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Overall Progress: 60% Complete  │
│ Estimated completion: Tomorrow   │
│                                 │
│ Notifications:                  │
│ 🔔 New anonymous concern added  │
│ 🔔 Conflict detected on Option 2│
│                                 │
│ [Send Reminders]               │
│ [View Anonymous Feedback]      │
└─────────────────────────────────┘
```

**Components**: Real-time participation tracking, progress indicators, notifications  
**API Integration**: GET /decisions/{id}/progress, GET /teams/{team_id}/participation  
**Navigation**: → Team member status or feedback screens

---

## Screen 12: Conflict Detection & Resolution
```
┌─────────────────────────────────┐
│ ← [Back] Conflict Resolution    │
│                                 │
│ ⚠️ Team Disagreement Detected   │
│                                 │
│ Conflict Summary:               │
│ Option 2: New Protocol          │
│                                 │
│ Areas of Disagreement:          │
│ ┌─────────────────────────────┐ │
│ │ Implementation Cost (25%)   │ │
│ │ Variance: 3.2 (High) ⚠️    │ │
│ │ Range: 3-9 (6 point spread)│ │
│ │                             │ │
│ │ Staff Training (20%)        │ │
│ │ Variance: 2.8 (Medium) ⚠️  │ │
│ │ Range: 4-8 (4 point spread)│ │
│ └─────────────────────────────┘ │
│                                 │
│ Anonymous Concerns:             │
│ 💬 "Timeline seems unrealistic" │
│ 💬 "Budget impact unclear"      │
│ 💬 "Need more training time"    │
│                                 │
│ Resolution Options:             │
│ [Schedule Team Discussion]      │
│ [Revise Option Details]        │
│ [Request Facilitator Help]     │
│ [Continue with Conflicts]      │
│                                 │
│ Conflict Level: HIGH ⚠️        │
└─────────────────────────────────┘
```

**Components**: Conflict visualization, variance scores, anonymous feedback, resolution options  
**API Integration**: GET /decisions/{id}/conflicts, POST /decisions/{id}/conflicts/resolve  
**Navigation**: → Conflict resolution workflow (Screens 24-26)

---

## Screen 13: Results & Analytics Dashboard
```
┌─────────────────────────────────┐
│ ← [Back] Decision Results       │
│                                 │
│ 📈 Team Analytics Dashboard    │
│                                 │
│ Recent Decisions (30 days):     │
│ ✅ Completed: 4                │
│ ⏳ In Progress: 3              │
│ ⚠️ Conflicts: 1               │
│                                 │
│ Team Performance:               │
│ ┌─────────────────────────────┐ │
│ │ Decision Speed: 12% faster  │ │
│ │ vs healthcare industry avg  │ │
│ │                             │ │
│ │ Consensus Rate: 85%         │ │
│ │ Conflicts resolved: 92%     │ │
│ │                             │ │
│ │ Participation: 94%          │ │
│ │ Avg response time: 18hrs    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Top Decision Outcomes:          │
│ 🏆 Medication Guidelines        │
│    98% staff compliance        │
│ 🏆 Staffing Protocol           │
│    15% efficiency gain         │
│                                 │
│ [Export Analytics]             │
│ [Team Report PDF]              │
│ [Historical Trends] →          │
└─────────────────────────────────┘
```

**Components**: Performance metrics, industry benchmarks, outcome tracking, export options  
**API Integration**: GET /teams/{team_id}/analytics, GET /decisions/{decision_id}/outcomes  
**Navigation**: → Detailed analytics or PDF export

---

## Screen 14: User Profile & Settings
```
┌─────────────────────────────────┐
│ ← [Back] Profile & Settings     │
│                                 │
│ 👨‍⚕️ Dr. Smith Profile           │
│                                 │
│ Healthcare Information:         │
│ ┌─────────────────────────────┐ │
│ │ Role: ICU Medical Director  │ │
│ │ Specialty: Critical Care    │ │
│ │ License: MD123456789        │ │
│ │ Years Experience: 15        │ │
│ └─────────────────────────────┘ │
│                                 │
│ Notification Preferences:       │
│ ☑ Decision phase transitions    │
│ ☑ Conflict alerts              │
│ ☑ Team member responses        │
│ ☐ Weekly analytics summary     │
│ ☑ HIPAA compliance updates     │
│                                 │
│ Security Settings:              │
│ • Two-factor authentication: ON │
│ • Session timeout: 2 hours     │
│ • HIPAA audit logging: ON      │
│                                 │
│ Team Memberships:               │
│ • ICU Leadership Team (Admin)   │
│ • Quality Committee (Member)    │
│ • Ethics Board (Facilitator)   │
│                                 │
│ [Update Profile]               │
│ [Change Password]              │
│ [Download My Data]             │
└─────────────────────────────────┘
```

**Components**: Healthcare credentials, notification preferences, security settings, team memberships  
**API Integration**: GET /users/{user_id}/profile, PUT /users/{user_id}/preferences  
**Navigation**: → Profile editing or security settings

---

## Implementation Notes

**Real-time Features**: Screens 11-12 require WebSocket integration for live collaboration and conflict detection.

**Healthcare-Specific**:
- Role-based permissions (Admin/Facilitator/Member)
- Healthcare credential validation
- HIPAA-compliant audit logging
- Anonymous evaluation preservation

**Performance Requirements**:
- Real-time presence tracking
- Conflict detection with 2.5 variance threshold  
- Industry benchmark comparisons
- Export capabilities for compliance reporting