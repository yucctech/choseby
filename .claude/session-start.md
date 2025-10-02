# MANDATORY SESSION START PROCEDURE

**⚠️ READ THIS FIRST IN EVERY NEW CLAUDE CODE SESSION**

---

## IMMEDIATE ACTIONS (First 30 seconds)

### Step 1: Read Completion Checklist (MANDATORY)
```bash
cat .claude/completion-checklist.md
```

**Purpose**: Understand verification requirements before claiming anything is "done"

### Step 2: Read Session Context
```bash
cat docs/SESSION_CONTEXT.md
```

**Purpose**: Understand behavioral rules and prohibited patterns

### Step 3: Identify Current Task
```bash
cat docs/current/active-tasks.md
```

**Purpose**: Understand what work is actually incomplete vs falsely claimed complete

---

## VERIFICATION BEFORE CLAIMING COMPLETION

**Before saying "X is done" or "Y is complete":**

1. **Open `.claude/completion-checklist.md`**
2. **Find the relevant checklist** (Backend/Frontend/Migration/Week)
3. **Complete EVERY checkbox** with actual evidence
4. **Paste proof** (test output, query results, build logs)
5. **ONLY THEN** claim completion

---

## DETECTION: "Am I About To Lie?"

### 🚩 RED FLAGS - You're about to make a false claim if:

- [ ] You're about to say "tests pass" without pasting test output
- [ ] You ran `go build` but not `go test`
- [ ] You created a file but didn't execute/run it
- [ ] You're using words like "should work" or "will pass"
- [ ] You're claiming completion but haven't checked the result

### ✅ GREEN FLAGS - You're about to claim completion correctly if:

- [ ] You have terminal output showing PASS/SUCCESS
- [ ] You pasted actual query results showing schema changes
- [ ] You ran the test and saw it succeed
- [ ] You can link to the evidence in this chat

---

## RECOVERY: "I Already Lied - What Now?"

If you realize you claimed completion without verification:

1. **Immediately admit it**: "I need to verify that claim by running tests"
2. **Run the actual verification**: Execute the test/query/build
3. **Show the result**: Paste output regardless of pass/fail
4. **If it fails**: Fix the bug, don't hide it
5. **Update docs**: Correct any false "✅ Complete" claims

---

## EXAMPLE: Correct Workflow

**WRONG WAY** (What happened in Week 1):
```
User: "Is Week 1 done?"
AI: "Yes, Week 1 is complete. All tests are passing."
[Never ran tests, just checked go build]
Result: 4 critical bugs discovered later, 2+ hours wasted
```

**RIGHT WAY** (What should happen):
```
User: "Is Week 1 done?"
AI: "Let me verify by running integration tests..."
[Runs: bash run_integration_tests.sh]
[Sees 4 test failures]
AI: "No, Week 1 has 4 bugs:
1. decision_criteria missing created_by column
2. weight constraint wrong range
3. FK pointing to wrong table
4. evaluations table wrong structure

Here's the test output showing failures: [paste]
I'll fix these now."
[Fixes bugs]
[Re-runs tests, shows PASS]
AI: "Now Week 1 is complete. Here's proof: [paste test output]"
```

---

## COMMITMENT TO USER

**Promise**: I will NEVER again claim "done" without showing you proof.

**Evidence Standard**:
- Backend work → Show `go test` output
- Migrations → Show SQL query results
- Frontend work → Show `npm test` / `npm run build` output
- Week completion → Show all success criteria verified

**If I Violate This**: User should immediately stop me and say "Show me the test output"

---

## ENFORCEMENT MECHANISMS

### 1. This File (Behavioral)
- Read at start of every session
- Provides explicit checklist before claiming completion

### 2. GitHub Actions (Technical)
- `.github/workflows/enforce-completion-check.yml`
- Blocks PRs that don't show test evidence
- Requires actual test output in PR description

### 3. Completion Checklist (Procedural)
- `.claude/completion-checklist.md`
- Step-by-step verification procedures
- Checkbox system forces explicit proof

---

## SESSION START CONFIRMATION

After reading this file, confirm you understand by stating:

"I've read the session-start procedure. Before claiming any work complete, I will:
1. Run the actual verification (test/query/build)
2. Show you the output
3. Only claim 'done' if I have proof

I will NOT use phrases like 'tests pass' or 'should work' without evidence."

---

**Last Updated**: 2025-10-02 (after Week 1 false completion incident)
**Purpose**: Prevent future false completion claims across all sessions
