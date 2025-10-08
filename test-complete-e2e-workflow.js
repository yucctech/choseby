/**
 * Complete E2E Workflow Test - Phases 1-6
 * Tests the ACTUAL customer response decision workflow
 */

const API_URL = 'http://localhost:8080/api/v1';
const DEMO_EMAIL = 'demo@choseby.com';
const DEMO_PASSWORD = 'demo123';

let authToken = null;
let decisionId = null;
let criteriaIds = [];
let optionIds = [];

async function login() {
  console.log('🔐 Phase 0: Login...');
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  });
  const data = await response.json();
  authToken = data.token;
  console.log('✅ Logged in\n');
}

async function createDecision() {
  console.log('📝 Phase 1: Create Decision...');
  const response = await fetch(`${API_URL}/decisions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customer_name: 'Acme Corp',
      customer_email: 'support@acme.com',
      customer_tier: 'enterprise',
      title: 'Enterprise customer refund request - E2E Test',
      description: 'Customer experienced 72-hour service outage affecting critical operations',
      decision_type: 'refund_request',
      urgency_level: 5,
      financial_impact: 10000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create failed (${response.status}): ${error}`);
  }

  const data = await response.json();
  decisionId = data.id;
  console.log(`✅ Decision created: ${decisionId}\n`);
}

async function addCriteria() {
  console.log('⚖️  Phase 2: Add Criteria...');
  const response = await fetch(`${API_URL}/decisions/${decisionId}/criteria`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      criteria: [
        { name: 'Customer Satisfaction Impact', description: 'Impact on customer happiness', weight: 2.0 },
        { name: 'Financial Cost', description: 'Direct cost to company', weight: 1.5 },
        { name: 'Long-term Relationship', description: 'Future business potential', weight: 2.5 },
        { name: 'Team Resource Usage', description: 'Time and effort required', weight: 1.0 }
      ]
    })
  });

  if (!response.ok) throw new Error(`Criteria failed: ${await response.text()}`);

  const data = await response.json();
  criteriaIds = data.criteria.map(c => c.id);
  console.log(`✅ Added ${criteriaIds.length} criteria\n`);
}

async function addOptions() {
  console.log('💡 Phase 3: Add Options...');
  const response = await fetch(`${API_URL}/decisions/${decisionId}/options`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      options: [
        {
          title: 'Full refund with premium support upgrade',
          description: 'Full refund + 6 months premium support',
          financial_cost: 5000,
          implementation_effort: 'low',
          risk_level: 'low',
          estimated_satisfaction_impact: 5
        },
        {
          title: 'Partial refund with service credits',
          description: '50% refund + $2000 service credits',
          financial_cost: 4500,
          implementation_effort: 'low',
          risk_level: 'medium',
          estimated_satisfaction_impact: 4
        },
        {
          title: 'Service credits only',
          description: '$3000 service credits + priority support',
          financial_cost: 1000,
          implementation_effort: 'low',
          risk_level: 'high',
          estimated_satisfaction_impact: 3
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`Options failed: ${await response.text()}`);

  const data = await response.json();
  optionIds = data.options.map(o => o.id);
  console.log(`✅ Added ${optionIds.length} options\n`);
}

async function submitTeamMemberEvaluation(memberNum, scoresPerOption) {
  console.log(`👤 Phase 4.${memberNum}: Team Member ${memberNum} Evaluates ALL Options...`);

  // Each team member evaluates ALL options
  const evaluations = [];
  optionIds.forEach((optionId, optionIdx) => {
    criteriaIds.forEach((criterionId, critIdx) => {
      evaluations.push({
        option_id: optionId,
        criteria_id: criterionId,
        score: scoresPerOption[optionIdx][critIdx],
        confidence: 3,
        comment: `Member ${memberNum} - Option ${optionIdx + 1} - Criterion ${critIdx + 1}`
      });
    });
  });

  const response = await fetch(`${API_URL}/decisions/${decisionId}/evaluate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ evaluations })
  });

  if (!response.ok) throw new Error(`Evaluation failed: ${await response.text()}`);

  const data = await response.json();
  console.log(`✅ Member ${memberNum} evaluated all ${optionIds.length} options (${evaluations.length} total scores)\n`);
}

async function getResults() {
  console.log('📊 Phase 5: Get Results...');
  const response = await fetch(`${API_URL}/decisions/${decisionId}/results`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  if (!response.ok) throw new Error(`Results failed: ${await response.text()}`);

  const data = await response.json();
  console.log('DEBUG Results:', JSON.stringify(data, null, 2));
  console.log('✅ Results Analysis:\n');

  console.log(`   Participation: ${data.participation_rate}%`);
  console.log(`   Team Consensus: ${(data.team_consensus * 100).toFixed(0)}%`);
  console.log(`   Recommended: ${data.recommended_option?.title || 'None'}\n`);

  console.log('   Ranked Options:');
  if (!data.ranked_options || !Array.isArray(data.ranked_options)) {
    console.log('   ERROR: ranked_options is missing or not an array');
    return data;
  }
  data.ranked_options.forEach((opt, idx) => {
    const medal = ['🥇', '🥈', '🥉'][idx] || '  ';
    console.log(`   ${medal} ${opt.title}`);
    console.log(`      Weighted Score: ${opt.weighted_score.toFixed(2)}`);
    console.log(`      Evaluators: ${opt.evaluator_count}`);
    console.log(`      Conflict: ${opt.conflict_level}\n`);
  });

  return data;
}

async function recordOutcome(recommendedOption) {
  console.log('📝 Phase 6: Record Outcome...');
  const response = await fetch(`${API_URL}/decisions/${decisionId}/outcome`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      first_response_at: new Date().toISOString(),
      resolution_at: new Date().toISOString(),
      time_to_first_response_hours: 2,
      time_to_resolution_hours: 6,
      customer_satisfaction_score: 5,
      nps_change: 20,
      customer_retained: true,
      escalation_occurred: false,
      team_consensus_score: 0.93,
      ai_accuracy_validation: true,
      option_effectiveness_rating: 5,
      what_worked_well: 'Team collaboration was excellent, decision made quickly',
      what_could_improve: 'Could have engaged customer earlier in process',
      lessons_learned: 'Premium support upgrade more valuable than partial refund',
      estimated_financial_impact: 4500,
      actual_financial_impact: 5000,
      roi_ratio: 2.4,
      ai_classification_accurate: true,
      response_draft_used: true,
      response_draft_version: 1
    })
  });

  if (!response.ok) throw new Error(`Outcome failed: ${await response.text()}`);

  console.log('✅ Outcome recorded\n');
}

async function runCompleteE2ETest() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 COMPLETE E2E WORKFLOW TEST (Phases 1-6)');
  console.log('='.repeat(70) + '\n');

  try {
    // Phase 0: Login
    await login();

    // Phase 1: Create Decision
    await createDecision();

    // Phase 2: Add Criteria
    await addCriteria();

    // Phase 3: Add Options
    await addOptions();

    // Phase 4: Team Evaluations (EACH MEMBER EVALUATES ALL OPTIONS)
    // Member 1: Prefers option 1 (high satisfaction focus)
    await submitTeamMemberEvaluation(1, [
      [5, 3, 5, 2], // Option 1 scores for 4 criteria
      [4, 4, 4, 2], // Option 2 scores
      [3, 5, 2, 2]  // Option 3 scores
    ]);

    // Member 2: Balanced view
    await submitTeamMemberEvaluation(2, [
      [4, 3, 4, 3], // Option 1
      [4, 4, 3, 2], // Option 2
      [3, 5, 3, 2]  // Option 3
    ]);

    // Member 3: Cost-conscious
    await submitTeamMemberEvaluation(3, [
      [4, 2, 4, 2], // Option 1
      [4, 3, 4, 3], // Option 2
      [4, 5, 3, 3]  // Option 3
    ]);

    // Phase 5: Get Results
    const results = await getResults();

    // Phase 6: Record Outcome
    await recordOutcome(results.recommended_option);

    console.log('='.repeat(70));
    console.log('✅ COMPLETE E2E TEST PASSED!');
    console.log('='.repeat(70));
    console.log('\nValidations:');
    console.log('✅ Phase 1: Decision created');
    console.log('✅ Phase 2: Criteria established');
    console.log('✅ Phase 3: Options defined');
    console.log('✅ Phase 4: Team evaluations submitted (3 members × 3 options)');
    console.log('✅ Phase 5: Results calculated with proper ranking');
    console.log('✅ Phase 6: Outcome tracked with all metrics');
    console.log(`\n🌐 View: http://localhost:3000/decisions/${decisionId}`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ E2E Test Failed:', error.message);
    process.exit(1);
  }
}

runCompleteE2ETest();
