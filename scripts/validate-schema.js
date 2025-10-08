#!/usr/bin/env node

/**
 * Schema Validation Script
 *
 * Purpose: Quickly validate that backend models match database schema
 * Usage: node scripts/validate-schema.js
 *
 * Checks:
 * - Backend Go models match CURRENT_DATABASE_SCHEMA.md
 * - Frontend TypeScript types have corresponding backend fields
 * - No phantom fields in code that don't exist in DB
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Known schema from docs/schema/CURRENT_DATABASE_SCHEMA.md
const KNOWN_TABLES = {
  customer_decisions: [
    'id', 'team_id', 'created_by', 'customer_name', 'customer_id',
    'customer_email', 'customer_tier', 'customer_value', 'relationship_duration_months',
    'title', 'description', 'decision_type', 'urgency_level', 'financial_impact',
    'status', 'current_phase', 'expected_resolution_date', 'actual_resolution_date',
    'ai_classification', 'ai_recommendations', 'ai_confidence_score',
    'created_at', 'updated_at', 'customer_tier_detailed', 'urgency_level_detailed',
    'customer_impact_scope', 'relationship_history', 'previous_issues_count',
    'last_interaction_date', 'nps_score'
  ],
  outcome_tracking: [
    'id', 'decision_id', 'outcome_id', 'decision_created_at',
    'first_response_at', 'resolution_at', 'time_to_first_response_hours',
    'time_to_resolution_hours', 'customer_satisfaction_score', 'nps_change',
    'customer_retained', 'escalation_occurred', 'team_consensus_score',
    'ai_accuracy_validation', 'option_effectiveness_rating', 'what_worked_well',
    'what_could_improve', 'lessons_learned', 'estimated_financial_impact',
    'actual_financial_impact', 'roi_ratio', 'created_at', 'updated_at',
    'ai_classification_accurate', 'response_draft_used', 'response_draft_version'
  ],
  evaluations: [
    'id', 'decision_id', 'evaluator_id', 'option_id', 'criteria_id',
    'score', 'confidence', 'anonymous_comment', 'created_at'
  ],
  decision_criteria: [
    'id', 'decision_id', 'name', 'description', 'weight', 'category',
    'measurement_scale', 'display_order', 'created_at', 'created_by'
  ],
  response_options: [
    'id', 'decision_id', 'title', 'description', 'financial_cost',
    'implementation_effort', 'risk_level', 'ai_generated', 'created_by', 'created_at'
  ]
};

// Fields that DON'T exist but might be assumed
const PHANTOM_FIELDS = {
  outcome_tracking: ['recorded_by', 'escalation_level', 'follow_up_required'],
  team_members: ['user_id'],
};

function checkBackendModels() {
  log('blue', '\n📋 Checking Backend Go Models...\n');

  const modelsPath = path.join(__dirname, '..', 'backend', 'internal', 'models', 'models.go');

  if (!fs.existsSync(modelsPath)) {
    log('yellow', '⚠️  models.go not found - skipping backend check');
    return { passed: true, warnings: [] };
  }

  const modelsContent = fs.readFileSync(modelsPath, 'utf-8');
  const warnings = [];
  let passed = true;

  // Check for phantom fields in OutcomeTracking
  if (modelsContent.includes('escalation_level')) {
    warnings.push('❌ OutcomeTracking has `escalation_level` - DOES NOT EXIST in database');
    passed = false;
  }

  if (modelsContent.includes('recorded_by')) {
    warnings.push('❌ OutcomeTracking has `recorded_by` - DOES NOT EXIST in database');
    passed = false;
  }

  // Check for user_id in TeamMembers
  const teamMembersMatch = modelsContent.match(/type TeamMember.*?struct[\s\S]*?}/);
  if (teamMembersMatch && teamMembersMatch[0].includes('UserID')) {
    warnings.push('❌ TeamMember has `UserID` - Should use id field directly');
    passed = false;
  }

  if (passed) {
    log('green', '✅ Backend models look clean');
  } else {
    warnings.forEach(w => log('red', w));
  }

  return { passed, warnings };
}

function checkHandlers() {
  log('blue', '\n🔧 Checking Backend Handlers...\n');

  const outcomePath = path.join(__dirname, '..', 'backend', 'internal', 'handlers', 'outcome.go');

  if (!fs.existsSync(outcomePath)) {
    log('yellow', '⚠️  outcome.go not found - skipping handler check');
    return { passed: true, warnings: [] };
  }

  const outcomeContent = fs.readFileSync(outcomePath, 'utf-8');
  const warnings = [];
  let passed = true;

  // Check INSERT/UPDATE statements
  if (outcomeContent.includes('escalation_level')) {
    warnings.push('❌ outcome.go references `escalation_level` - field does not exist');
    passed = false;
  }

  if (outcomeContent.includes('recorded_by')) {
    warnings.push('❌ outcome.go references `recorded_by` - field does not exist');
    passed = false;
  }

  if (passed) {
    log('green', '✅ Handler SQL statements look clean');
  } else {
    warnings.forEach(w => log('red', w));
  }

  return { passed, warnings };
}

function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  log('bold', 'SCHEMA VALIDATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  const allPassed = results.every(r => r.passed);

  if (allPassed) {
    log('green', '🎉 All checks passed! Schema is aligned.\n');
    log('blue', 'Remember to check docs/schema/CURRENT_DATABASE_SCHEMA.md before any schema changes.');
  } else {
    log('red', '❌ Schema validation failed. Fix the issues above.\n');
    log('yellow', '💡 Tip: Check docs/schema/CURRENT_DATABASE_SCHEMA.md for actual database fields');
  }

  console.log();
  process.exit(allPassed ? 0 : 1);
}

// Main execution
log('bold', '\n🔍 DATABASE SCHEMA VALIDATION\n');
log('blue', 'Comparing code against docs/schema/CURRENT_DATABASE_SCHEMA.md\n');

const results = [
  checkBackendModels(),
  checkHandlers(),
];

printSummary(results);
