# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status: Critical Pivot Phase
- **IMPORTANT**: Project pivoted from complex decision frameworks to simple vendor comparison templates
- **Current Phase**: Wireframe development for customer validation (Week 1-2)
- **Budget**: $15K maximum development spend
- **Timeline**: 4 months to first paying customers
- **Customer Validation**: Based on Interview #9 healthcare feedback

## Technology Stack (Budget-Conscious)
- **Frontend**: React/Next.js (standard web app)
- **Backend**: Node.js with simple database
- **Database**: PostgreSQL on free tier
- **Hosting**: Vercel/Netlify free tiers initially
- **AI Requirements**: NONE (major cost savings vs original approach)

## Core Architecture & Design Principles

### Customer-Validated Product Direction
Build simple vendor comparison templates, NOT complex decision frameworks. Key customer quote: *"Template that helps organize vendor comparisons consistently"* - Interview #9 healthcare operations manager.

### Critical Design Principles
1. **Simplicity Over Sophistication**: If it requires explanation, it's too complex
2. **Enhancement Over Replacement**: Augment current workflows, don't force new methodologies  
3. **Political Neutrality**: No features that create interpersonal hierarchy or conflict
4. **Immediate Value**: Value visible within first 10 minutes of use

### User Flow Architecture (6 Core Screens)
1. **Decision Setup**: Simple initialization without stakeholder weighting
2. **Individual Dashboard**: Role-based private assessment to eliminate groupthink
3. **Vendor Evaluation**: Structured comparison template with industry-specific criteria
4. **Conflict Detection**: Automated identification of stakeholder disagreements
5. **Collaborative Resolution**: Structured discussion facilitation without politics
6. **Executive Summary**: Auto-generated 2-paragraph recommendation format

## Key Documentation Files
- `docs/README.md`: Current project handover and tactical pivot details
- `docs/stakeholder-collaboration-user-flow.md`: Complete design specification for development
- `docs/essential-business-data.md`: Customer validation results and requirements
- `docs/SESSION_CONTEXT.md`: Essential guidelines for AI sessions

## Customer Requirements (Interview #9 Validated)
**What They Want**:
- Template that helps organize vendor comparisons consistently
- Industry-specific question sets (e.g., "questions to ask scheduling software vendors")
- Simple pros/cons organization tools
- Reference check tracking
- Two-paragraph executive summaries (not pages of analysis)

**What They Explicitly Reject**:
- Numerical scoring systems
- Stakeholder weighting
- Complex risk matrices
- Multi-page analytical reports

## Development Constraints
- **No source code exists yet** - this is a documentation-only repository in design phase
- **No package.json, build scripts, or test commands** - these will be created during development
- Target completion time: <30 minutes per vendor evaluation
- Must maintain political neutrality in all features
- Executive summary format must be exactly 2 paragraphs

## Validation Requirements
Before development begins, wireframes must be tested with 3 customers minimum:
1. Healthcare (different clinic than Interview #9)
2. Professional Services (accounting or legal firm)
3. Alternative Industry (manufacturing or financial services)

Success criteria: <30 minutes completion time, prefers new approach over current process, confirms $3,600 annual pricing acceptable.

## File Creation Guidelines
**NEVER create without permission**:
- summary.md, recap.md, session-summary.md
- test-results.md, analysis.md, findings.md
- todo.md, next-steps.md, action-items.md
- Duplicate files with version numbers

## Project Goal
Build what customers asked for: simple vendor comparison templates that solve their "everyone has opinions but no clear framework" problem while maintaining team relationships and political neutrality.