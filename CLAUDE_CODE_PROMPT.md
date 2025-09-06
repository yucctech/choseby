# CLAUDE CODE STARTUP PROMPT

## PROJECT INITIALIZATION
I need you to build a market validation prototype for the Kryver AI Decision Platform. This is a 2-week sprint to create an interactive demo that will test customer willingness to pay premium pricing for AI-assisted decision templates.

## IMMEDIATE TASKS
1. **Review project documentation** in the docs/ folder, specifically:
   - `docs/essential-business-data.md` (customer requirements & pricing targets)
   - `docs/technical/prototype-development-plan.md` (complete technical specifications)
   - `docs/operations/current-status.md` (strategic context)

2. **Analyze any UI mockups or wireframes** if provided (drag/drop images or reference file paths)
   - Use visual analysis to understand design requirements
   - Generate components that match provided designs
   - Ask: "Generate React components to match this design mockup"

3. **Build Smart Framework Builder prototype** - a React/Next.js single-page application where users describe a decision and get a customized evaluation template

4. **Focus on UX flow over AI complexity** - simulate AI responses with pre-written content, no real AI integration needed

## CORE PROTOTYPE REQUIREMENTS

### User Flow
1. User describes decision ("selecting healthcare scheduling software")
2. System asks 2-3 context questions (industry, team size, budget range)
3. Generate customized evaluation template with relevant criteria
4. Allow template customization (edit criteria, adjust weights, reorder)
5. Export as PDF or spreadsheet for actual use

### Key Features
- **Industry-specific templates**: Healthcare, Professional Services, Manufacturing
- **Decision type detection**: Vendor selection, hiring, strategic planning, investment
- **Export functionality**: PDF generation and spreadsheet download
- **Usage analytics**: Track completion rates, time spent, feature usage
- **Feedback collection**: Post-demo survey about value and pricing

### Simulated AI Intelligence
Create JSON database with realistic responses for:
- Healthcare + Vendor Selection → HIPAA compliance, EHR integration, staff training requirements
- Professional Services + Hiring → Client experience, technical skills, cultural fit criteria
- Manufacturing + Investment → ROI analysis, safety requirements, scalability factors

## TECHNICAL CONSTRAINTS
- **Timeline**: 2 weeks maximum for functional demo
- **Tech Stack**: React/Next.js, minimal backend complexity
- **No Real AI**: Focus on user experience flow, simulate AI responses
- **Export Required**: Must generate usable templates users can actually apply to decisions
- **Analytics Essential**: Need usage data for market validation

## VALIDATION TESTING SETUP
- **Demo Mode**: Pre-populated sample decisions for easy testing
- **Real Mode**: Users input actual pending decisions
- **Success Metrics**: >80% completion rate, >15 minutes engagement time
- **Pricing Test**: Include $21.50/user/month pricing question in feedback

## DEVELOPMENT SUCCESS CRITERIA
✅ Smart Framework Builder prototype fully functional
✅ 3+ industry templates with realistic criteria  
✅ PDF and spreadsheet export working
✅ Usage analytics tracking implemented
✅ Feedback collection system ready

## MARKET VALIDATION GOAL
This prototype will test with 5 real pending decisions from our network to determine if customers will pay premium pricing for AI-assisted decision templates vs simple static templates. The results determine our full development scope and budget.

**Ready to start development of Smart Framework Builder prototype.**