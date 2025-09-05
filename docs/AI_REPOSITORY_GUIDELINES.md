# AI Repository Management Guidelines

## 🚫 STRICT NO-CLUTTER RULES FOR AI ASSISTANTS

### Prohibited AI Behaviors
**NEVER create these files without explicit permission:**
- `summary.md`, `recap.md`, `session-summary.md` or similar
- `test-results.md`, `analysis.md`, `findings.md`  
- `todo.md`, `next-steps.md`, `action-items.md`
- Duplicate files with version numbers (file-v2.md, file-final.md)
- Backup files (.bak, .old, .prev extensions)
- Temporary files (temp-, draft-, wip- prefixes)

### Update-Only Policy
**AI must UPDATE existing files, not create new ones:**
- Update `operations/current-status.md` instead of creating status summaries
- Update domain files instead of creating separate analysis documents  
- Add to existing specifications instead of creating duplicate specs
- Append to existing ADRs instead of creating new decision records

### Required Permission Protocol
**Before creating ANY new file, AI must:**
1. Check if existing file can be updated instead
2. Explicitly ask permission: "Should I create [filename] or update [existing-file]?"
3. Explain why a new file is necessary vs updating existing
4. Wait for explicit approval before file creation

### Approved File Creation (Only With Permission)
**New files allowed only when:**
- Adding new feature to `technical/feature-specs/[feature-name].md`
- Creating new ADR in `interfaces/decisions/ADR-###-[topic].md`
- Adding new sprint to `operations/sprints/sprint-##.md`
- Adding new experiment to `metrics/experiments/[experiment-name].md`

## 📝 Content Update Guidelines

### Efficient Update Patterns
**Instead of creating summaries, update existing files:**
- Add insights to relevant domain files
- Update current-status.md with progress
- Append decisions to existing ADRs
- Add metrics to existing KPI files

### Version Control Philosophy  
**Use Git for history, not file naming:**
- Git tracks all changes and history
- No need for backup files or version suffixes
- Commit messages explain what changed and why
- File content should always represent current state

### Cross-Reference Instead of Duplicate
**Link to authoritative sources:**
- Reference existing domain files instead of copying content
- Use markdown links to point to single source of truth
- Update source documents rather than creating derivatives

## ⚡ Implementation Protocol

### Session Start Checklist for AI
1. Review existing file structure before planning work
2. Identify which existing files need updates
3. Confirm no redundant file creation planned
4. Ask permission for any new file creation

### During Work Session
- Update existing files progressively
- Use in-place editing for improvements
- Link between files instead of duplicating content
- Commit frequently with descriptive messages

### Session End Protocol
- Update `operations/current-status.md` with progress
- No session summary files created
- All work captured in domain file updates
- Next session context available in updated files

## 🎯 Repository Cleanliness Metrics

### Success Indicators
- File count grows only with genuine new features/decisions
- All files serve active purpose (no orphaned documents)
- Clear ownership for every file (domain-based)
- Easy navigation without clutter

### Red Flags (Immediate Cleanup Required)
- Multiple files covering same topic
- Files with version numbers or backup suffixes
- Standalone summary/analysis documents
- Orphaned files with unclear purpose

This protocol ensures repository stays clean and navigable while supporting comprehensive AI-assisted development.
