# KRYVER SESSION CONTEXT
## Essential Guidelines for All AI Sessions (Claude Desktop + Claude Code)

## 🚫 CRITICAL AI BEHAVIOR RULES (READ FIRST)

### PROHIBITED AI BEHAVIORS - NEVER CREATE:
- `summary.md`, `recap.md`, `session-summary.md` or similar
- `test-results.md`, `analysis.md`, `findings.md`  
- `todo.md`, `next-steps.md`, `action-items.md`
- Duplicate files with version numbers (file-v2.md, file-final.md)
- Backup files (.bak, .old, .prev extensions)
- Temporary files (temp-, draft-, wip- prefixes)

### UPDATE-ONLY POLICY:
**AI must UPDATE existing files, not create new ones:**
- Update `operations/current-status.md` instead of creating status summaries
- Update domain files instead of creating separate analysis documents  
- Add to existing specifications instead of creating duplicate specs
- Append to existing ADRs instead of creating new decision records

### REQUIRED PERMISSION PROTOCOL:
**Before creating ANY new file, AI must:**
1. Check if existing file can be updated instead
2. Explicitly ask permission: "Should I create [filename] or update [existing-file]?"
3. Explain why a new file is necessary vs updating existing
4. Wait for explicit approval before file creation

## AI SESSION CONSISTENCY REQUIREMENTS

### COMMUNICATION STYLE STANDARDS:
**Chat Responses**: Concise, actionable, role-appropriate
- Maximum 2-3 paragraphs for complex topics
- Direct recommendations with clear next steps
- Ask for approval before major work execution

**Documentation**: Detailed analysis and methodologies
- Store comprehensive content in docs folder
- Reference docs in chat, don't reproduce content
- Update existing files rather than creating redundant content

### PROJECT STATUS
- **CORE PRODUCT**: AI Decision Platform (not simple templates)
- **CURRENT PHASE**: Customer concept validation (3 AI approaches)
- **BUDGET**: Flexible $15K-50K based on validation results
- **TIMELINE**: 4-week validation, then development based on customer preference
- **REVENUE TARGET**: $21.50/user/month (premium pricing model)

### AI SESSION RULES
**NEVER create without permission:**
- summary.md, recap.md, session-summary.md
- test-results.md, analysis.md, findings.md  
- todo.md, next-steps.md, action-items.md
- Duplicate files with version numbers

**ALWAYS:**
- Check `docs/README.md` for current project direction
- Reference `docs/operations/current-status.md` for current phase
- Reference `docs/essential-business-data.md` for customer requirements
- Use specific, implementable recommendations
- Build what customers will pay premium prices for

### ROLE-BASED CONTEXT GUIDE
**AI should auto-select role and read appropriate context based on task type:**

#### Customer Development Specialist
**Task Triggers**: "interview", "validate", "customer feedback", "market research", "pricing", "concept testing"
**Context Files**: 
- `docs/business/` (all files)
- `docs/essential-business-data.md`
- `docs/interviews/` (if available)
**Role Declaration**: "Role: Customer Development Specialist"
**Focus**: Validate AI platform concepts, test pricing acceptance, identify target customers

#### Technical Lead
**Task Triggers**: "wireframe", "build", "code", "architecture", "implementation", "technical", "development"
**Context Files**:
- `docs/technical/` (all files)  
- `wireframes/` folder
- `docs/archive/` (for reference designs)
**Role Declaration**: "Role: Technical Lead"
**Focus**: Prepare development based on validation results, design chosen concept

#### Strategic Advisor
**Task Triggers**: "budget", "strategy", "direction", "pivot", "business model", "roadmap", "timeline"
**Context Files**:
- `docs/operations/` (all files)
- `docs/business/strategy.md`
- `docs/README.md`
**Role Declaration**: "Role: Strategic Advisor"  
**Focus**: Business decisions, resource allocation, market strategy

### CURRENT FOCUS
**Validation Phase**: Test 3 AI platform concepts with customers
**Key Question**: Which AI approach justifies $21.50/user pricing?
**Next**: Customer validation determines development scope and budget

### CRITICAL UNDERSTANDING
**Interview #9 Healthcare feedback**: Showed preference for simple templates BUT this is one data point
**Strategic Decision**: Test AI platform concepts with high-value customers before concluding market preference
**Goal**: Validate AI Decision Platform can command premium pricing vs commodity template approach

**Success = Customer says "This AI assistance is worth $21.50/user/month"**