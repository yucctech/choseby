# Choseby Team Decision Platform

**Status**: ✅ Development Execution Phase  
**Budget**: $50K approved ($25K Phase 1, $25K Phase 2)  
**Timeline**: 8-week MVP targeting healthcare teams  
**Goal**: 5 paying customers, $500+ MRR by Week 8

## Quick Navigation

### 🤖 For AI Sessions (REQUIRED READING)
- **Claude Code**: Start with [`docs/ai-context/CLAUDE_CODE_CONTEXT.md`](docs/ai-context/CLAUDE_CODE_CONTEXT.md)
- **Claude Desktop**: Start with [`docs/ai-context/CLAUDE_DESKTOP_CONTEXT.md`](docs/ai-context/CLAUDE_DESKTOP_CONTEXT.md)  
- **GitHub Copilot**: Reference [`docs/ai-context/COPILOT_CONTEXT.md`](docs/ai-context/COPILOT_CONTEXT.md)
- **Session Memory**: [`docs/ai-context/SESSION_SUMMARIES.md`](docs/ai-context/SESSION_SUMMARIES.md)
- **Project Rules**: [`docs/SESSION_CONTEXT.md`](docs/SESSION_CONTEXT.md) ⚠️ **READ FIRST**

### 📊 Current Status
- **Sprint Progress**: [`docs/current/SPRINT_STATUS.md`](docs/current/SPRINT_STATUS.md)
- **Active Tasks**: [`docs/current/ACTIVE_TASKS.md`](docs/current/ACTIVE_TASKS.md)
- **Blockers**: [`docs/current/BLOCKERS.md`](docs/current/BLOCKERS.md)

### 🏗️ Technical Reference  
- **Architecture**: [`docs/technical/architecture.md`](docs/technical/architecture.md)
- **Database Schema**: [`docs/technical/database-schema.md`](docs/technical/database-schema.md)
- **API Design**: [`docs/technical/api-design.md`](docs/technical/api-design.md)
- **Deployment**: [`docs/technical/deployment.md`](docs/technical/deployment.md)

### 💼 Business Intelligence
- **Customer Interviews**: [`docs/business/customer-interviews/`](docs/business/customer-interviews/)
- **Customer Insights**: [`docs/business/customer-insights/`](docs/business/customer-insights/)
- **Market Strategy**: [`docs/business/market-strategy.md`](docs/business/market-strategy.md)
- **Business Metrics**: [`docs/business/business-metrics.md`](docs/business/business-metrics.md)
- **Future Features**: [`docs/business/future-features/`](docs/business/future-features/) (AI individual platform, roadmap)

### 🎯 Decision Records
- **Architecture Decisions**: [`docs/decisions/`](docs/decisions/)
- **Business Decisions**: [`docs/decisions/`](docs/decisions/)

---

## Project Overview

**Team Decision Platform for 5-8 person leadership teams**

### Market Validation ✅
- **15/15 interviews successful** across Healthcare, Professional Services, Manufacturing, Tech Scale-ups
- **Universal pain points**: Team coordination costs $20K-70K per decision
- **Revenue model**: $107.50-172/month per team (250-400% increase vs individual tools)
- **Customer budgets**: 150-400% above our pricing across all segments

### Technical Architecture ✅  
- **FREE Development**: Supabase + Vercel ($0/month during MVP)
- **Production Ready**: Same stack scales to millions of users
- **Multi-tenant**: Row Level Security for team data isolation
- **Real-time**: Team collaboration with conflict detection

### Success Metrics
- **Week 4**: Anonymous input collection working with pilot customers
- **Week 8**: 5 paying healthcare teams, $500+ MRR  
- **Week 16**: 15 paying teams across all segments, $2K+ MRR

---

## 🤖 AI Assistant Entry Points

### Claude Desktop (Strategy, Documentation, Business)
- **Entry Point**: Use project instructions in this README
- **Focus**: Wireframes, customer development, strategy, documentation, business analysis
- **Current Priority**: Create mobile-first wireframes for 23 healthcare decision screens

### Claude Code (Programming, Implementation)  
- **Entry Point**: `CLAUDE.md` (complete technical specifications)
- **Focus**: Backend API development, database implementation, authentication, deployment
- **Current Priority**: Implement Node.js/Express backend using complete API specification

**Role Separation**:
- **Business/Strategy Tasks** → Claude Desktop (use README + docs/ai-context/)
- **Programming/Coding Tasks** → Claude Code (use CLAUDE.md + docs/technical/)
- **Technical Documentation Complete** → Ready for both parallel development streams

---

## Development Team

**Solo Founder + AI Team**:
- **You**: Product strategy, customer development, technical architecture
- **Claude Code**: Implementation, code quality, technical documentation
- **Claude Desktop**: Business strategy, customer research, process optimization  
- **GitHub Copilot**: Code suggestions, pattern consistency, development velocity

**AI Context Management**: Each platform maintains session continuity through dedicated context files, enabling seamless collaboration across development sessions.

---

*Last Updated: Auto-maintained by AI team*