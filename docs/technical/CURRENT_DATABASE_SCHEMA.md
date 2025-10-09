# Choseby Database Schema - ACTUAL STATE (As of 2025-10-09)

**⚠️ THIS IS THE SINGLE SOURCE OF TRUTH FOR DATABASE SCHEMA**

Before modifying ANY backend handler or frontend type, CHECK THIS FILE FIRST.

Generated from: Supabase PostgreSQL `igrmbkienznttmunapix`
Last Updated: 2025-10-09

---

## Table of Contents
1. [customer_decisions](#customer_decisions)
2. [decision_criteria](#decision_criteria)
3. [response_options](#response_options)
4. [evaluations](#evaluations)
5. [outcome_tracking](#outcome_tracking)
6. [team_members](#team_members)
7. [teams](#teams)

---

## customer_decisions

**Purpose**: Core decision tracking with customer context

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| team_id | uuid | NO | - | FK to teams |
| created_by | uuid | NO | - | FK to team_members |
| customer_name | varchar(255) | NO | - | Required |
| customer_id | varchar(100) | YES | - | Optional external ID |
| customer_email | varchar(255) | YES | - | |
| customer_tier | varchar(20) | YES | 'standard' | Enum: standard, premium, enterprise |
| customer_value | numeric | YES | - | Lifetime value |
| relationship_duration_months | integer | YES | 0 | |
| title | varchar(500) | NO | - | Decision title |
| description | text | NO | - | Decision description |
| decision_type | varchar(50) | NO | - | E.g., refund_request, escalation |
| urgency_level | integer | NO | 3 | 1-5 scale |
| financial_impact | numeric | YES | - | Estimated cost |
| status | varchar(20) | YES | 'created' | Enum: created, in_progress, completed |
| current_phase | integer | YES | 1 | 1-6 (workflow phases) |
| expected_resolution_date | timestamp | YES | - | |
| actual_resolution_date | timestamp | YES | - | |
| ai_classification | jsonb | YES | - | AI classification results |
| ai_recommendations | jsonb | YES | - | AI recommendations |
| ai_confidence_score | numeric | YES | - | 0-1 scale |
| created_at | timestamp | YES | now() | |
| updated_at | timestamp | YES | now() | |
| customer_tier_detailed | varchar(20) | YES | 'standard' | bronze/silver/gold/platinum |
| urgency_level_detailed | varchar(20) | YES | 'medium' | low/medium/high/critical |
| customer_impact_scope | varchar(30) | YES | 'single_user' | single_user/team/department/company |
| relationship_history | text | YES | - | Historical context |
| previous_issues_count | integer | YES | 0 | Issue frequency |
| last_interaction_date | timestamp | YES | - | |
| nps_score | integer | YES | - | Net Promoter Score |

**Key Constraints**:
- `customer_tier` CHECK: IN ('free', 'starter', 'professional', 'enterprise', 'standard', 'premium')
- `urgency_level` CHECK: BETWEEN 1 AND 5

---

## decision_criteria

**Purpose**: Weighted decision criteria for evaluation

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | uuid_generate_v4() | Primary key |
| decision_id | uuid | YES | - | FK to customer_decisions |
| name | varchar(200) | NO | - | Criterion name |
| description | text | YES | - | |
| weight | numeric | YES | 1.0 | Importance weight (typically 1.0-3.0) |
| category | varchar(50) | YES | 'technical' | |
| measurement_scale | varchar(50) | YES | 'likert_5' | |
| display_order | integer | YES | 0 | UI ordering |
| created_at | timestamp with time zone | YES | now() | |
| created_by | uuid | NO | - | FK to team_members |

**Key Points**:
- Weight determines importance in weighted scoring
- Default scale is likert_5 (1-5)

---

## response_options

**Purpose**: Response options to evaluate

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| decision_id | uuid | NO | - | FK to customer_decisions |
| title | varchar(500) | NO | - | Option title |
| description | text | NO | - | Detailed description |
| financial_cost | numeric | YES | 0 | Estimated cost |
| implementation_effort | varchar(20) | YES | 'medium' | low/medium/high |
| risk_level | varchar(20) | YES | 'medium' | low/medium/high |
| ai_generated | boolean | YES | false | AI-generated flag |
| created_by | uuid | YES | - | FK to team_members |
| created_at | timestamp | YES | now() | |

---

## evaluations

**Purpose**: Team member evaluations (anonymous)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| decision_id | uuid | NO | - | FK to customer_decisions |
| evaluator_id | uuid | NO | - | FK to team_members |
| option_id | uuid | NO | - | FK to response_options |
| criteria_id | uuid | NO | - | FK to decision_criteria |
| score | integer | NO | - | 1-5 score |
| confidence | integer | YES | 5 | 1-5 confidence level |
| anonymous_comment | text | YES | - | Optional feedback |
| created_at | timestamp | YES | now() | |

**Critical Structure**:
- **One row per criterion per option per evaluator**
- Example: 3 options × 4 criteria × 1 evaluator = 12 evaluation rows
- This enables weighted scoring calculation

---

## outcome_tracking

**Purpose**: Decision outcomes and learning

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| decision_id | uuid | NO | - | FK to customer_decisions |
| outcome_id | uuid | YES | - | Optional external outcome ID |
| decision_created_at | timestamp | NO | - | Original decision timestamp |
| first_response_at | timestamp | YES | - | First response time |
| resolution_at | timestamp | YES | - | Resolution time |
| time_to_first_response_hours | numeric | YES | - | Calculated metric |
| time_to_resolution_hours | numeric | YES | - | Calculated metric |
| customer_satisfaction_score | integer | YES | - | 1-5 scale |
| nps_change | integer | YES | - | NPS delta |
| customer_retained | boolean | YES | - | Retention flag |
| escalation_occurred | boolean | YES | false | Escalation flag |
| team_consensus_score | numeric | YES | - | 0-1 consensus metric |
| ai_accuracy_validation | boolean | YES | - | AI accuracy check |
| option_effectiveness_rating | integer | YES | - | 1-5 rating |
| what_worked_well | text | YES | - | Success factors |
| what_could_improve | text | YES | - | Improvement areas |
| lessons_learned | text | YES | - | Key learnings |
| estimated_financial_impact | numeric | YES | - | Estimated cost |
| actual_financial_impact | numeric | YES | - | Actual cost |
| roi_ratio | numeric | YES | - | ROI calculation |
| created_at | timestamp | YES | now() | |
| updated_at | timestamp | YES | now() | |
| ai_classification_accurate | boolean | YES | - | AI classification validation |
| response_draft_used | boolean | YES | false | Draft usage flag |
| response_draft_version | integer | YES | - | Version number |

**⚠️ Notable Fields**:
- `outcome_id` is nullable (can be NULL)
- No `recorded_by` field exists (removed from backend)
- No `escalation_level` field exists (removed from backend)

---

## team_members

**Purpose**: User accounts and team membership

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | uuid_generate_v4() | Primary key |
| team_id | uuid | YES | - | FK to teams |
| role | varchar(50) | YES | 'member' | owner/admin/member |
| permissions | text[] | YES | '{}' | Permission array |
| joined_at | timestamp with time zone | YES | now() | |
| is_active | boolean | YES | true | Active status |
| email | varchar(255) | NO | - | **Required** |
| name | varchar(255) | NO | - | **Required** |
| password_hash | varchar(255) | YES | - | Hashed password |
| expertise_areas | text[] | YES | - | Areas of expertise |
| escalation_authority | integer | YES | 1 | Authority level |
| notification_preferences | jsonb | YES | {"email":true,"push":true,"sms":false} | |
| created_at | timestamp | YES | now() | |
| updated_at | timestamp | YES | now() | |

**Key Points**:
- Serves as both user account and team membership
- Email and name are required
- No separate `user_id` field

---

## teams

**Purpose**: Team/organization information

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | uuid_generate_v4() | Primary key |
| name | varchar(100) | NO | - | Team name |
| description | text | YES | - | |
| organization | varchar(200) | YES | - | Organization name |
| department | varchar(100) | YES | - | |
| team_type | varchar(50) | YES | 'standard' | |
| settings | jsonb | YES | '{}' | Team settings |
| created_by | uuid | YES | - | FK to team_members |
| created_at | timestamp with time zone | YES | now() | |
| updated_at | timestamp with time zone | YES | now() | |
| is_active | boolean | YES | true | |
| company_name | varchar(255) | YES | - | |
| industry | varchar(100) | YES | - | |
| team_size | integer | YES | 5 | Default team size |
| subscription_tier | varchar(20) | YES | 'starter' | starter/professional/enterprise |

---

## Common Patterns Across Tables

### UUID Primary Keys
- All tables use `uuid` primary keys
- Most use `gen_random_uuid()` or `uuid_generate_v4()`

### Timestamps
- `created_at` / `updated_at` pattern
- Mix of `timestamp` and `timestamp with time zone`
- Default to `now()`

### Foreign Keys
- `decision_id` → customer_decisions.id
- `team_id` → teams.id
- `created_by` / `evaluator_id` → team_members.id
- `option_id` → response_options.id
- `criteria_id` → decision_criteria.id

---

## ⚠️ CRITICAL DEVELOPER NOTES

### Before Writing Any Handler Code:

1. **Check this file FIRST** - Don't assume field names
2. **Verify nullable vs required** - Many fields are nullable
3. **Check default values** - Don't override defaults unnecessarily
4. **Validate data types** - numeric vs integer vs varchar

### Common Gotchas:

❌ **WRONG**: Assuming `recorded_by` exists in outcome_tracking
✅ **RIGHT**: Use only fields listed above

❌ **WRONG**: Using `user_id` in team_members
✅ **RIGHT**: team_members.id IS the user ID

❌ **WRONG**: Sending single evaluation with scores map
✅ **RIGHT**: Send array of evaluations (one per criterion per option)

❌ **WRONG**: Assuming all varchar fields have same length
✅ **RIGHT**: Check max length (20 vs 50 vs 100 vs 255 vs 500)

### Schema Update Process:

1. **Modify database FIRST** (Supabase UI or migration)
2. **Update this file** with new schema
3. **Regenerate types** (future: automated)
4. **Update handlers/models** to match
5. **Update frontend types** to match

---

## Validation Checklist

Before committing any handler/model changes:

- [ ] Checked CURRENT_DATABASE_SCHEMA.md
- [ ] Verified all field names match exactly
- [ ] Confirmed nullable/required matches
- [ ] Validated data types (numeric vs integer)
- [ ] Checked varchar max lengths
- [ ] Confirmed foreign key references
- [ ] Tested with actual database

---

**Last Schema Validation**: 2025-10-09 02:00 UTC
**Next Validation**: Before any schema-touching code changes
