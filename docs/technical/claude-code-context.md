# CLAUDE CODE CONTEXT & PROMPT PACKAGE

## PROJECT CONTEXT FOR CLAUDE CODE
**Repository**: E:\Repositories\Kryver\
**Project**: AI Decision Platform prototype development
**Current Phase**: Market validation through interactive demos
**Timeline**: 2-week development sprint for primary prototype

## STRATEGIC BACKGROUND
We're building the **Smart Framework Builder** prototype to test market demand for AI-assisted decision templates vs simple static templates. This prototype will determine whether customers will pay premium pricing ($21.50/user/month) for AI assistance.

**Customer Scenario**: Operations manager needs to select healthcare scheduling software. Instead of building vendor comparison criteria from scratch, they describe the decision and get a customized evaluation template.

## CLAUDE CODE DEVELOPMENT PROMPT

### Initial Setup Command
```
Review the project documentation in docs/ folder, particularly:
- docs/essential-business-data.md (customer requirements)
- docs/technical/prototype-development-plan.md (full technical specs)
- docs/operations/current-status.md (current phase context)

Build a React/Next.js prototype for the "Smart Framework Builder" concept as specified in the prototype development plan.
```

### Core Development Requirements
1. **Single-page application** for Smart Framework Builder
2. **Simulated AI responses** (no real AI integration needed)
3. **Export functionality** (PDF and spreadsheet generation)
4. **Usage analytics** tracking for validation testing
5. **2-week maximum timeline** for functional demo

### Key Components to Build
- Decision input form with industry/type selectors
- Dynamic context questions based on selection
- Template generation with customized criteria
- Template customization tools (edit, reorder, weight)
- Export options for generated templates

### Pre-written Response Database
Create JSON files with realistic templates for:
- Healthcare + Vendor Selection
- Professional Services + Hiring  
- Manufacturing + Investment
- Other common SMB decision scenarios

### Validation Testing Features
- Demo mode with sample decisions
- Real mode for actual pending decisions
- Post-demo feedback collection
- Usage analytics dashboard

## SUCCESS CRITERIA FOR CLAUDE CODE
**Primary Goal**: Functional prototype ready for customer testing in 2 weeks
**Validation Target**: Test with 5 real pending decisions from network
**Success Metrics**: >80% completion rate, >15 minutes engagement, pricing acceptance

## DEVELOPMENT CONSTRAINTS
- **No real AI required**: Focus on UX flow over AI capability
- **Speed over polish**: Market validation prototype, not production system
- **Simple tech stack**: React/Next.js, minimal backend complexity
- **Export functionality**: Must generate usable templates (PDF/spreadsheet)

## POST-DEVELOPMENT HANDOFF
After prototype completion, customer testing will determine:
- Market validation for AI-assisted approach
- Customer pricing acceptance at premium levels
- Next phase development scope and budget

---

**Ready for Claude Code implementation of Smart Framework Builder prototype per technical specifications.**