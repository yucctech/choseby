# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

# 🚀 CHOSEBY CUSTOMER RESPONSE DECISION INTELLIGENCE - IMPLEMENTATION READY

## PROJECT STATUS: COMPLETE TECHNICAL SPECIFICATIONS → CLAUDE CODE IMPLEMENTATION ✅
**Product**: Customer Response Decision Intelligence Platform for 5-20 person customer-facing teams
**Market**: SaaS, E-commerce, Professional Services, B2B Services (50-500 employees)
**Backend**: Complete API specifications with database schema ready for implementation
**Target**: Frontend + backend implementation to achieve $500+ MRR from 5 customer response teams by Week 8

---

## 🚨 CRITICAL: READ THESE FILES IN EXACT ORDER BEFORE ANY WORK

Every new Claude Code session MUST read these files in this exact sequence:

1. **`.claude/session-start.md`** - ⚠️ **MANDATORY FIRST READ** - Session start procedure & verification requirements
2. **`.claude/completion-checklist.md`** - ⚠️ **MANDATORY VERIFICATION SYSTEM** - Prevents false completion claims
3. **`docs/SESSION_CONTEXT.md`** - ⚠️ **CRITICAL AI BEHAVIOR RULES** - NEVER claim completion without running tests
4. **`docs/technical/implementation-summary.md`** - **"CLAUDE CODE START HERE"** - Complete implementation guide
5. **`docs/technical/api-specifications.md`** - Complete REST API endpoint specifications
6. **`docs/technical/database-schema.md`** - PostgreSQL schema ready for implementation
7. **`docs/technical/frontend-components.md`** - React component specifications with customer response workflows

### ⚠️ NEVER CLAIM COMPLETION WITHOUT RUNNING TESTS

**Before marking ANY task complete, you MUST:**
```bash
cd backend
make local  # Fast validation (10 sec)
make test   # All tests (unit + integration)
```

**RED FLAGS - Stop if you see yourself doing these:**
- ❌ "Tests created" ≠ "Tests passing"
- ❌ "Code compiles" (`go build`) ≠ "Code works" (`make test`)
- ❌ "Migration file created" ≠ "Migration applied to database"
- ❌ Marking Week/Sprint complete without running integration tests

**This rule was added after Week 1 failure: Claimed completion without running tests or applying migration.**

---

## 🌐 **LIVE PLATFORM INFRASTRUCTURE** ✅

### **Deployment URLs (Ready for Customer Response Implementation)**:
- **Frontend**: https://choseby.vercel.app (Next.js app ready for customer response interface)
- **Backend API**: https://choseby.onrender.com (Go/Gin server ready for customer response endpoints)
- **Health Check**: https://choseby.onrender.com/api/v1/health (Platform monitoring)
- **Database**: Supabase PostgreSQL (Ready for customer response schema implementation)

### **Customer Response Platform Architecture**:
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS (Customer response UI workflows)
- **Backend**: Go/Gin API server with customer response decision endpoints
- **Database**: PostgreSQL with customer response context and team decision tables
- **AI Integration**: DeepSeek API for customer issue classification and recommendations
- **Authentication**: JWT with customer response team role-based access

---

## 📋 **REQUIRED READING (in order)**:
1. `docs/SESSION_CONTEXT.md` (AI behavior rules)
2. `docs/ai-context/CLAUDE_DESKTOP_CONTEXT.md` (business context)  
3. `docs/technical/implementation-summary.md` (technical foundation - implementation ready)
4. `docs/current/active-tasks.md` (current sprint priorities)

## 🎯 **CURRENT PHASE: Customer Response Platform Implementation (Week 1-8)**
**✅ COMPLETED**: Strategic Foundation & Documentation Complete
- Market strategy for Customer Response Decision Intelligence ✅
- Customer development methodology for customer-facing teams ✅  
- Technical implementation roadmap (95% backend reuse, 80% frontend) ✅
- Complete technical specifications (API, database, frontend) ✅

**🚧 READY FOR IMPLEMENTATION**: Platform Development & Customer Acquisition
- Database schema implementation for customer response context
- DeepSeek AI integration for cost-effective intelligence
- Frontend development with customer response workflows
- Backend API implementation with customer response endpoints

## 📊 **Business Intelligence & Strategy**:
- **Market Strategy**: `docs/business/market-strategy.md`
- **Customer Development**: `docs/business/customer-development.md`  
- **Active Sprint Plan**: `docs/current/active-tasks.md`
- **Success Metrics**: `docs/business/success-metrics.md`

## 🔧 **Technical Foundation (IMPLEMENTATION READY)**:
- **API Infrastructure**: `docs/technical/api-specifications.md`
  - Complete REST endpoint specifications for customer response workflows
  - Anonymous evaluation & conflict detection for customer response decisions
  - Team management & real-time collaboration for customer-facing teams
- **Database Schema**: `docs/technical/database-schema.md`
  - Complete PostgreSQL schema optimized for customer response context
- **Frontend Components**: `docs/technical/frontend-components.md`
  - React component specifications for customer response workflows
- **Implementation Guide**: `docs/technical/implementation-summary.md`
  - Step-by-step development roadmap for Claude Code
- **Testing Infrastructure**: `backend/README.md#testing`
  - Modern Go testing setup with GitHub Actions CI/CD
  - Run `make local` before pushing code (10 second validation)
  - 22.5% baseline coverage → 60%+ target after customers

---

## 🎯 **CUSTOMER RESPONSE PLATFORM PRIORITIES**

### **Week 1-2: Customer Response Backend (Claude Code Focus)**
- Implement customer response database schema (teams, decisions, evaluations, outcomes)
- Build customer response API endpoints (decision creation, team evaluation, AI integration)
- Integrate DeepSeek AI for customer issue classification and stakeholder recommendations
- Set up customer response authentication and team management

### **Week 3-4: Customer Response Frontend (Claude Code Focus)**  
- Build customer response decision creation workflow (2-minute setup with AI classification)
- Implement structured team input system (anonymous evaluation preventing hierarchy bias)
- Create customer response analytics dashboard (response time, customer satisfaction)
- Mobile-first design for urgent customer response scenarios

### **Week 5-6: Customer Response Integration (Claude Code Focus)**
- End-to-end customer response decision workflow testing
- Customer response outcome tracking and analytics
- Performance optimization for customer response team efficiency
- Customer response platform polish and error handling

### **Week 7-8: Customer Response Deployment & Customer Acquisition**
- Production deployment of customer response platform
- Customer response team onboarding and pilot customer acquisition
- Customer response success metrics tracking and optimization
- Revenue generation from customer response team efficiency improvements

---

## 💰 **VALIDATED BUSINESS MODEL**:
**CORE PRINCIPLE**: Build Customer Response Decision Intelligence that eliminates 3-5 day email threads  
**TARGET MARKET**: Customer-facing teams (support, success, sales) at growing companies  
**PRICING**: Team-based $199-699/month with clear ROI tied to response time improvement  
**TARGET**: 5 customer response teams, $500+ MRR by Week 8

## 🎯 **Customer Response Priority Features**:
- AI-powered customer issue classification (DeepSeek integration)
- Anonymous team evaluation for unbiased customer response decisions
- Customer context capture (tier, value, relationship history)
- Response time tracking and consistency measurement
- Customer satisfaction correlation with decision quality

---

## 🏗️ **CUSTOMER RESPONSE TECHNICAL STACK**

### **Backend Implementation (Claude Code)**
- **Language**: Go/Gin framework for customer response API endpoints
- **Database**: PostgreSQL with customer response optimized schema and indexes
- **AI Service**: DeepSeek API integration for customer issue classification
- **Authentication**: JWT with customer response team role-based permissions
- **Deployment**: Render.com for customer response API hosting

### **Frontend Implementation (Claude Code)**
- **Framework**: Next.js 14 with TypeScript for customer response workflows
- **Styling**: Tailwind CSS with customer response team interface components
- **State Management**: React Context + React Query for customer response data
- **Real-time**: WebSocket support for customer response team collaboration
- **Deployment**: Vercel for customer response platform hosting

### **Customer Response AI Integration**
- **Classification**: DeepSeek AI for customer issue type and urgency detection
- **Recommendations**: AI-powered stakeholder suggestions and response options
- **Learning**: Customer satisfaction outcome correlation for continuous improvement
- **Cost Optimization**: DeepSeek API for cost-effective AI capabilities vs OpenAI

---

## 📋 **CUSTOMER RESPONSE PLATFORM FEATURES**

### **Core Customer Response Workflow**
1. **Decision Creation** (2-minute setup): Customer issue input with AI classification
2. **Team Input Collection**: Anonymous evaluation from support, success, sales, legal teams
3. **AI-Powered Synthesis**: Smart recommendations and draft customer responses
4. **Outcome Tracking**: Customer satisfaction correlation and response time analytics

### **Customer Response Team Management**
- Customer response team creation and member invitation
- Role-based permissions (customer success manager, support manager, etc.)
- Customer response decision history and analytics
- Team performance metrics and improvement insights

### **Customer Response Intelligence**
- Customer issue classification and priority assignment
- Response time tracking and customer satisfaction correlation
- Team decision consistency measurement and improvement
- Customer response outcome learning for future decisions

---

## 🎯 **SUCCESS METRICS FOR CUSTOMER RESPONSE PLATFORM**

### **Technical KPIs (Claude Code Implementation)**
- Customer response decision workflow completion rate >90%
- Response time improvement from 3-5 days to same-day decisions
- Customer response platform uptime >99.9%
- Mobile responsiveness for urgent customer response scenarios

### **Business KPIs (Customer Response Team Value)**
- 5 customer response teams acquired paying $199-699/month
- $500+ MRR from customer response team efficiency improvements
- 60%+ reduction in customer response decision time
- >90% customer satisfaction with customer response consistency

### **Customer Response Platform KPIs**
- Customer satisfaction improvement correlation with faster responses
- Reduced escalation rates from more consistent initial responses
- Team coordination efficiency measured through decision completion rates
- Customer response outcome tracking for continuous platform improvement

---

## 🔧 **CUSTOMER RESPONSE DEVELOPMENT GUIDELINES**

### **Code Quality Standards**
- TypeScript for complete type safety across customer response workflows
- Mobile-first responsive design for urgent customer response scenarios
- Error handling with graceful degradation for customer response teams
- Performance optimization for customer response team productivity

### **Customer Response Business Logic**
- Customer context integration (tier, relationship history, value, satisfaction)
- Anonymous evaluation system preventing hierarchy bias in customer response decisions
- AI-powered customer issue classification and stakeholder recommendations
- Customer response outcome tracking for satisfaction correlation and improvement

### **Testing Strategy**
**Before ANY code push:**
```bash
cd backend
make local  # 10 seconds - format, vet, fast tests
```

**Testing infrastructure:**
- GitHub Actions runs automatically on push (safety net)
- golangci-lint with 50+ code quality checks
- 22.5% baseline coverage → 60%+ target
- See `backend/README.md#testing` for complete workflow

**Philosophy:**
- Fast local validation (`make local`) before push
- GitHub Actions as mandatory enforcement
- Focus on feature delivery, not perfect coverage
- Increase test quality as customer base grows

---

## 📈 **CUSTOMER RESPONSE REVENUE MODEL**

### **Team-Based SaaS Pricing**
- **Small Response Team**: $199/month (3-8 members) - Core workflow + basic analytics
- **Standard Response Team**: $399/month (9-15 members) - Advanced AI + integrations
- **Large Response Team**: $699/month (16-25 members) - Custom AI training + dedicated support

### **Customer Response ROI Value**
- **Time Savings**: 12 hours/week saved = $2,400/month value vs $199-699/month cost
- **Customer Satisfaction**: Faster response times improve NPS and reduce churn
- **Team Efficiency**: Structured decision process reduces coordination chaos and improves consistency

---

## 📁 **Navigation & Resources**:
- **Project Hub**: `README.md`
- **Business Strategy**: `docs/business/market-strategy.md`
- **Sprint Planning**: `docs/current/active-tasks.md`
- **Technical Foundation**: `docs/technical/implementation-summary.md`

## 🔧 **ROLE SEPARATION**:
- **Claude Desktop**: Strategy, documentation, customer development, business analysis, competitive research
- **Claude Code**: Backend implementation, database development, AI integration, frontend customer response development

## ⚠️ **CRITICAL AI BEHAVIOR RULES**:
- **Never create summary/recap/analysis files** - UPDATE existing files only
- **Update-only policy**: Modify existing docs rather than creating duplicate content
- **Permission protocol**: Ask before creating any new files vs updating existing ones
- **Role-appropriate tasks**: Business/strategy → Desktop, Programming/implementation → Code

## 🔑 **VALIDATION CHECKS**:
- **IMPLEMENTATION-READY**: All technical specifications complete and validated
- **Customer Focus**: All decisions must align with customer-facing team requirements and ROI demonstration
- **Revenue Target**: $500+ MRR by Week 8 through 5 customer response teams

**IMPLEMENTATION PRIORITY**: Focus on customer response team value delivery through faster decision times, improved customer satisfaction, and team coordination efficiency to achieve $500+ MRR by Week 8.

**NEXT ACTION**: Begin implementation following `docs/technical/implementation-summary.md` - complete technical specifications ready for immediate development.
