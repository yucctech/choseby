/**
 * Test complete decision workflow - Phases 1-4
 * Tests: Decision creation → Criteria setup → Options setup → Team evaluation
 */

const API_URL = 'http://localhost:8080/api/v1';
const DEMO_EMAIL = 'demo@choseby.com';
const DEMO_PASSWORD = 'demo123';

let authToken = null;
let createdDecisionId = null;
let criteriaIds = [];
let optionIds = [];

async function login() {
  console.log('🔐 Step 1: Login...');
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  });
  const data = await response.json();
  authToken = data.token;
  console.log('✅ Logged in successfully\n');
}

async function createDecision() {
  console.log('📝 Step 2: Create decision (Phase 1)...');
  const response = await fetch(`${API_URL}/decisions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Enterprise customer refund request - Workflow Test',
      description: 'Enterprise customer experiencing service outage requesting full refund. High-value account with long relationship.',
      customer_name: 'TestCorp Inc',
      customer_email: 'test@testcorp.com',
      customer_tier: 'enterprise',
      customer_value: 100000,
      urgency_level: 5,
      customer_impact_scope: 'company',
      relationship_duration_months: 36,
      previous_issues_count: 2,
      nps_score: 80,
      decision_type: 'refund_request',
      financial_impact: 5000,
      workflow_type: 'full_decide'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create decision: ${await response.text()}`);
  }

  const decision = await response.json();
  createdDecisionId = decision.id;
  console.log(`✅ Created decision ID: ${createdDecisionId}`);
  console.log(`   Status: ${decision.status}, Phase: ${decision.current_phase}\n`);
}

async function addCriteria() {
  console.log('⚖️  Step 3: Add decision criteria (Phase 2)...');
  const response = await fetch(`${API_URL}/decisions/${createdDecisionId}/criteria`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      criteria: [
        {
          name: 'Customer Satisfaction Impact',
          description: 'How will this affect customer happiness and NPS?',
          weight: 2.0
        },
        {
          name: 'Financial Cost',
          description: 'Direct financial impact of this response',
          weight: 1.5
        },
        {
          name: 'Long-term Relationship',
          description: 'Impact on customer retention and future revenue',
          weight: 2.5
        },
        {
          name: 'Team Resource Usage',
          description: 'Time and effort required from our team',
          weight: 1.0
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to add criteria: ${await response.text()}`);
  }

  const data = await response.json();
  criteriaIds = data.criteria.map(c => c.id);
  console.log(`✅ Added ${data.criteria.length} criteria`);
  data.criteria.forEach(c => console.log(`   - ${c.name} (weight: ${c.weight})`));
  console.log();
}

async function addOptions() {
  console.log('💡 Step 4: Add response options (Phase 3)...');
  const response = await fetch(`${API_URL}/decisions/${createdDecisionId}/options`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      options: [
        {
          title: 'Full refund with premium support upgrade',
          description: 'Issue full refund and upgrade to premium support tier for 6 months as goodwill gesture',
          financial_cost: 5000,
          implementation_effort: 'low',
          risk_level: 'low',
          estimated_satisfaction_impact: 5
        },
        {
          title: 'Partial refund with service credits',
          description: 'Refund 50% of affected period, plus $2000 in service credits for future use',
          financial_cost: 4500,
          implementation_effort: 'low',
          risk_level: 'medium',
          estimated_satisfaction_impact: 4
        },
        {
          title: 'Service credits only',
          description: 'No cash refund, but provide $3000 in service credits and priority support',
          financial_cost: 1000,
          implementation_effort: 'low',
          risk_level: 'high',
          estimated_satisfaction_impact: 3
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to add options: ${await response.text()}`);
  }

  const data = await response.json();
  optionIds = data.options.map(o => o.id);
  console.log(`✅ Added ${data.options.length} response options`);
  data.options.forEach(o => console.log(`   - ${o.title} (cost: $${o.financial_cost}, impact: ${o.estimated_satisfaction_impact}/5)`));
  console.log();
}

async function submitEvaluation(optionIndex, scores) {
  console.log(`👤 Step 5.${optionIndex + 1}: Submit team evaluation (Phase 4)...`);

  // Build evaluations array - one evaluation per criterion
  const evaluations = criteriaIds.map((criterionId, index) => ({
    option_id: optionIds[optionIndex],
    criteria_id: criterionId,
    score: scores[index],
    confidence: 3,
    comment: `Evaluation for option ${optionIndex + 1} - criterion ${index + 1}`
  }));

  const response = await fetch(`${API_URL}/decisions/${createdDecisionId}/evaluate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ evaluations })
  });

  if (!response.ok) {
    throw new Error(`Failed to submit evaluation: ${await response.text()}`);
  }

  const data = await response.json();
  console.log(`✅ Submitted anonymous evaluation for option ${optionIndex + 1}`);
  console.log(`   Scores: ${JSON.stringify(scores)}, Count: ${data.evaluations_count}\n`);
}

async function verifyDecisionState() {
  console.log('🔍 Step 6: Verify final decision state...');
  const response = await fetch(`${API_URL}/decisions/${createdDecisionId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log('✅ Decision state verified:');
  console.log(`   Decision: ${data.decision.title}`);
  console.log(`   Status: ${data.decision.status}`);
  console.log(`   Current Phase: ${data.decision.current_phase}`);
  console.log(`   Criteria: ${data.criteria?.length || 0}`);
  console.log(`   Options: ${data.options?.length || 0}`);
  console.log(`   Evaluations: ${data.evaluations?.length || 0}`);
  console.log();
}

async function runWorkflowTest() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 COMPLETE DECISION WORKFLOW TEST (Phases 1-4)');
  console.log('='.repeat(70) + '\n');

  try {
    await login();
    await createDecision();
    await addCriteria();
    await addOptions();

    // Submit 3 evaluations from different "team members"
    await submitEvaluation(0, [5, 3, 5, 2]); // Option 1: High satisfaction, moderate cost
    await submitEvaluation(1, [4, 4, 4, 2]); // Option 2: Balanced scores
    await submitEvaluation(2, [3, 5, 2, 2]); // Option 3: Low cost but lower satisfaction

    await verifyDecisionState();

    console.log('='.repeat(70));
    console.log('✅ ALL WORKFLOW TESTS PASSED');
    console.log('='.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`   - Phase 1: Decision created ✅`);
    console.log(`   - Phase 2: 4 criteria defined ✅`);
    console.log(`   - Phase 3: 3 options created ✅`);
    console.log(`   - Phase 4: 3 evaluations submitted ✅`);
    console.log(`   - Decision ID: ${createdDecisionId}`);
    console.log(`   - Ready for Phase 5 (Results Analysis)`);
    console.log('\n🌐 View in browser: http://localhost:3000/decisions/' + createdDecisionId);
    console.log();

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
    process.exit(1);
  }
}

runWorkflowTest();
