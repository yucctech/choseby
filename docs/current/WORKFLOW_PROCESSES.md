# Team Workflow Processes

## Solo Founder + AI Team Coordination

### Daily Workflow
**Morning Startup (9 AM)**:
1. Check `docs/current/SPRINT_STATUS.md` for current priorities
2. Review `docs/current/ACTIVE_TASKS.md` for immediate actions
3. Update Claude Code/Desktop context if needed
4. Begin development/business work based on priorities

**Evening Wrap-up (6 PM)**:
1. Update task completion status in `docs/current/ACTIVE_TASKS.md`
2. Note any blockers in `docs/current/BLOCKERS.md`
3. Update AI context files with major decisions/changes
4. Plan next day priorities

### Cross-Domain Coordination

#### Business ↔ Technical Alignment
**Trigger**: Customer feedback impacts technical priorities
**Process**:
1. **Customer Insight**: Claude Desktop conducts interview/research
2. **Technical Impact**: Assess implications for current development
3. **Priority Adjustment**: Update `docs/current/ACTIVE_TASKS.md` 
4. **Context Update**: Claude Code context updated with business requirements
5. **Implementation**: Technical work proceeds with business context

**Example**: Customer requests HIPAA compliance → Technical team prioritizes security features

#### Technical ↔ Business Feedback Loop
**Trigger**: Technical constraints affect business promises  
**Process**:
1. **Technical Limitation**: Claude Code identifies development constraint
2. **Business Assessment**: Evaluate impact on customer commitments
3. **Decision Required**: Founder chooses scope vs timeline trade-off
4. **Communication**: Update customer expectations if needed
5. **Documentation**: Record decision in `docs/decisions/ADR-XXX.md`

**Example**: Database complexity affects Week 4 milestone → Adjust customer pilot timeline

### Decision Escalation Framework

#### When Cross-Domain Conflicts Arise:
1. **Identify Conflict**: Document competing priorities between business/technical
2. **Assess Trade-offs**: 
   - **Business Impact**: Customer satisfaction, revenue, market position
   - **Technical Impact**: Development timeline, complexity, quality
   - **Resource Impact**: Solo founder time allocation, budget implications
3. **Make Decision**: Founder decision with clear rationale
4. **Document Decision**: Create ADR in `docs/decisions/`
5. **Update Context**: All AI platforms get updated context
6. **Execute**: Proceed with aligned understanding

#### Common Conflict Types:
- **Speed vs Quality**: Customer urgency vs technical excellence
- **Scope vs Timeline**: Feature requests vs MVP delivery
- **Cost vs Capability**: Budget constraints vs technical sophistication

### Dependency Monitoring

#### High-Risk Dependencies:
1. **Customer Validation → Product Direction**: Weekly validation affects all development
2. **Technical Feasibility → Business Promises**: Development capacity affects customer commitments  
3. **Solo Founder Capacity → All Timelines**: 8-hour daily availability affects everything

#### Mitigation Strategies:
1. **Weekly Reviews**: Every Friday assess cross-domain alignment
2. **Clear Priorities**: `docs/current/ACTIVE_TASKS.md` shows priority hierarchy
3. **Context Preservation**: AI platforms maintain continuity across sessions
4. **Decision Documentation**: All major choices recorded in `docs/decisions/`

### Communication Protocols

#### AI Context Handoffs:
**Claude Desktop → Claude Code**:
- Business requirements documented in customer insights
- Technical implications noted in session summaries
- Both contexts reference same source documents

**Claude Code → Claude Desktop**:
- Technical constraints communicated via decision records
- Development progress updated in current status
- Implementation reality informs business strategy

#### Customer Communication:
**Pilot Customer Updates**: Weekly progress calls with sprint status
**Feedback Integration**: Customer insights flow to business docs → technical requirements
**Expectation Management**: Technical constraints inform customer timeline communication

### Quality Assurance Processes

#### Documentation Maintenance:
- **Single Source of Truth**: No duplicate information across files
- **Regular Updates**: AI contexts updated with each major decision
- **Reference Integrity**: Links between documents maintained
- **Archive Management**: Historical content preserved in `future-features/`

#### Decision Quality:
- **Evidence-Based**: Customer validation drives feature priorities
- **Technical Reality**: Development constraints inform business commitments  
- **Resource Alignment**: Decisions respect solo founder capacity limitations
- **Success Tracking**: Business metrics validate decision effectiveness

### Success Indicators

#### Process Working Well:
- ✅ **Context Continuity**: Fresh AI sessions have full project understanding
- ✅ **Aligned Priorities**: Business and technical work support same goals
- ✅ **Clear Decisions**: No confusion about project direction or priorities
- ✅ **Customer Success**: Pilot customers see consistent progress and value
- ✅ **Sustainable Pace**: Solo founder maintains productivity without burnout

#### Process Needs Adjustment:
- ❌ **Context Loss**: AI sessions lack critical project information
- ❌ **Priority Conflicts**: Business and technical work pulling in different directions
- ❌ **Decision Paralysis**: Unclear trade-offs preventing progress
- ❌ **Customer Confusion**: Inconsistent messaging or timeline changes
- ❌ **Capacity Overload**: Solo founder working unsustainable hours

**Review Schedule**: Weekly process assessment during Friday reviews, monthly optimization during sprint retrospectives.