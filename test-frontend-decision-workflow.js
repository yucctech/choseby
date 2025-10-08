/**
 * Test complete decision creation workflow through frontend API
 */

const API_URL = 'http://localhost:8080/api/v1';
const DEMO_EMAIL = 'demo@choseby.com';
const DEMO_PASSWORD = 'demo123';

let authToken = null;

async function login() {
  console.log('🔐 Logging in...');
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  });
  const data = await response.json();
  authToken = data.token;
  console.log('✅ Logged in successfully\n');
}

async function createDecision(tier) {
  console.log(`📝 Creating ${tier} tier decision...`);
  const response = await fetch(`${API_URL}/decisions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: `Customer requesting refund - ${tier} tier`,
      description: `High-value ${tier} customer is dissatisfied with recent service outage and requesting full refund.`,
      customer_name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Corp`,
      customer_email: `contact@${tier}corp.com`,
      customer_tier: tier,
      customer_value: tier === 'enterprise' ? 100000 : tier === 'premium' ? 50000 : tier === 'standard' ? 10000 : 5000,
      urgency_level: tier === 'enterprise' ? 5 : tier === 'premium' ? 4 : 3,
      customer_impact_scope: tier === 'enterprise' ? 'company' : 'single_user',
      relationship_duration_months: 24,
      previous_issues_count: 2,
      nps_score: 70,
      decision_type: 'refund_request',
      financial_impact: 5000,
      workflow_type: 'full_decide'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create decision: ${JSON.stringify(error)}`);
  }

  const decision = await response.json();
  console.log(`✅ Created decision ID: ${decision.id}`);
  return decision.id;
}

async function getDecisionDetail(decisionId) {
  console.log(`📋 Fetching decision detail...`);
  const response = await fetch(`${API_URL}/decisions/${decisionId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`✅ Retrieved decision: ${data.decision.title}`);
  return data;
}

async function listDecisions() {
  console.log(`📑 Fetching decisions list...`);
  const response = await fetch(`${API_URL}/decisions?limit=10`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`✅ Found ${data.total} total decisions, showing ${data.decisions.length}\n`);
  return data;
}

async function runWorkflowTest() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 FRONTEND DECISION WORKFLOW TEST');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Login
    await login();

    // Step 2: Create decision for each tier
    const tiers = ['basic', 'standard', 'premium', 'enterprise'];
    const createdIds = [];

    for (const tier of tiers) {
      const id = await createDecision(tier);
      createdIds.push(id);
      await new Promise(resolve => setTimeout(resolve, 200)); // Brief delay
    }

    console.log('\n' + '-'.repeat(70) + '\n');

    // Step 3: Get detail for last created decision
    const lastId = createdIds[createdIds.length - 1];
    const detail = await getDecisionDetail(lastId);

    console.log('\n' + '-'.repeat(70) + '\n');

    // Step 4: List all decisions
    const list = await listDecisions();

    console.log('='.repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`   - Created ${createdIds.length} decisions across all tiers`);
    console.log(`   - Successfully retrieved decision detail`);
    console.log(`   - Successfully listed ${list.total} total decisions`);
    console.log(`   - Customer tier constraint fix WORKING ✅`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runWorkflowTest();
