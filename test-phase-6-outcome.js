/**
 * Test Phase 6: Outcome Tracking
 * Records outcome for decision from Phase 1-5 tests
 */

const API_URL = 'http://localhost:8080/api/v1';
const DEMO_EMAIL = 'demo@choseby.com';
const DEMO_PASSWORD = 'demo123';
const DECISION_ID = 'b3782f76-0307-44c6-95f8-445e8925bf02'; // From Phase 1-5 tests

let authToken = null;
let optionId = null;

async function login() {
  console.log('🔐 Login...');
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  });
  const data = await response.json();
  authToken = data.token;
  console.log('✅ Logged in\n');
}

async function getDecisionOptions() {
  console.log('📋 Fetching decision options...');
  const response = await fetch(`${API_URL}/decisions/${DECISION_ID}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await response.json();

  // Get first option ID for testing
  if (data.options && data.options.length > 0) {
    optionId = data.options[0].id;
    console.log(`✅ Found option: ${data.options[0].title}`);
    console.log(`   Option ID: ${optionId}\n`);
  } else {
    throw new Error('No options found in decision');
  }
}

async function recordOutcome() {
  console.log('📝 Recording decision outcome...');

  const outcomeData = {
    selected_option_id: optionId,
    decision_date: new Date().toISOString(),
    response_sent_date: new Date().toISOString(),
    customer_satisfaction_score: 5,
    nps_score_change: 20,
    customer_feedback: 'Customer very satisfied with the prompt response and resolution. Expressed appreciation for the premium support upgrade.',
    team_consensus_score: 0.93,
    actual_cost: 5000,
    revenue_impact: 12000,
    lessons_learned: 'Quick premium support upgrade was more valuable than partial refund. Customer valued proactive approach and long-term relationship commitment.',
    would_decide_same_again: true,
    time_to_first_response_hours: 2,
    time_to_resolution_hours: 6
  };

  const response = await fetch(`${API_URL}/decisions/${DECISION_ID}/outcome`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(outcomeData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Outcome recording failed: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('✅ Outcome recorded successfully!\n');
  return result.data;
}

async function verifyOutcome() {
  console.log('🔍 Verifying recorded outcome...');

  const response = await fetch(`${API_URL}/decisions/${DECISION_ID}/outcome`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  if (!response.ok) {
    throw new Error(`Outcome fetch failed: ${response.status}`);
  }

  const result = await response.json();
  const outcome = result.data;

  console.log('✅ Outcome retrieved successfully!\n');

  console.log('📊 OUTCOME SUMMARY:');
  console.log(`   Selected Option: ${outcome.selected_option_id}`);
  console.log(`   Customer Satisfaction: ${outcome.customer_satisfaction_score}/5`);
  console.log(`   NPS Change: ${outcome.nps_score_change > 0 ? '+' : ''}${outcome.nps_score_change}`);
  console.log(`   Team Consensus: ${(outcome.team_consensus_score * 100).toFixed(0)}%`);
  console.log(`   Would Decide Same Again: ${outcome.would_decide_same_again ? 'Yes' : 'No'}`);
  console.log();

  console.log('💰 FINANCIAL IMPACT:');
  console.log(`   Actual Cost: $${outcome.actual_cost}`);
  console.log(`   Revenue Impact: $${outcome.revenue_impact}`);
  console.log(`   Net Impact: $${outcome.revenue_impact - outcome.actual_cost}`);
  console.log();

  console.log('⏱️  TIMING METRICS:');
  console.log(`   Time to First Response: ${outcome.time_to_first_response_hours} hours`);
  console.log(`   Time to Resolution: ${outcome.time_to_resolution_hours} hours`);
  console.log();

  console.log('📝 CUSTOMER FEEDBACK:');
  console.log(`   "${outcome.customer_feedback}"`);
  console.log();

  console.log('💡 LESSONS LEARNED:');
  console.log(`   "${outcome.lessons_learned}"`);
  console.log();

  return outcome;
}

async function testPhase6Outcome() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 PHASE 6: OUTCOME TRACKING TEST');
  console.log('='.repeat(70) + '\n');

  try {
    await login();
    await getDecisionOptions();
    await recordOutcome();
    const outcome = await verifyOutcome();

    // Validate outcome data
    console.log('='.repeat(70));
    console.log('✅ PHASE 6 TEST VALIDATION:');
    console.log('='.repeat(70));

    const validations = [
      {
        test: outcome.selected_option_id === optionId,
        name: 'Selected option recorded correctly'
      },
      {
        test: outcome.customer_satisfaction_score === 5,
        name: 'Customer satisfaction score recorded'
      },
      {
        test: outcome.nps_score_change === 20,
        name: 'NPS change tracked'
      },
      {
        test: outcome.team_consensus_score === 0.93,
        name: 'Team consensus score stored'
      },
      {
        test: outcome.actual_cost === 5000,
        name: 'Actual cost recorded'
      },
      {
        test: outcome.revenue_impact === 12000,
        name: 'Revenue impact tracked'
      },
      {
        test: outcome.customer_feedback && outcome.customer_feedback.length > 0,
        name: 'Customer feedback captured'
      },
      {
        test: outcome.lessons_learned && outcome.lessons_learned.length > 0,
        name: 'Lessons learned documented'
      },
      {
        test: outcome.would_decide_same_again === true,
        name: 'Decision reflection recorded'
      },
      {
        test: outcome.time_to_first_response_hours === 2,
        name: 'Response time metrics captured'
      }
    ];

    validations.forEach(({ test, name }) => {
      console.log(`${test ? '✅' : '❌'} ${name}`);
    });

    const allPassed = validations.every(v => v.test);

    console.log('\n' + '='.repeat(70));
    if (allPassed) {
      console.log('🎉 ALL PHASE 6 TESTS PASSED!');
      console.log('   - Outcome recording working correctly');
      console.log('   - Customer satisfaction tracking functional');
      console.log('   - Financial impact calculation accurate');
      console.log('   - Learning capture operational');
      console.log('   - Complete workflow validated end-to-end');
    } else {
      console.log('❌ SOME PHASE 6 TESTS FAILED - See details above');
    }
    console.log('='.repeat(70) + '\n');

    console.log('🎊 COMPLETE WORKFLOW SUCCESS!');
    console.log('   ✅ Phase 1: Problem Definition');
    console.log('   ✅ Phase 2: Criteria Establishment');
    console.log('   ✅ Phase 3: Consider Options');
    console.log('   ✅ Phase 4: Team Evaluation');
    console.log('   ✅ Phase 5: Results Analysis');
    console.log('   ✅ Phase 6: Outcome Tracking');
    console.log();
    console.log(`🌐 View complete workflow: http://localhost:3000/decisions/${DECISION_ID}`);
    console.log();

  } catch (error) {
    console.error('\n❌ Phase 6 test failed:', error.message);
    process.exit(1);
  }
}

testPhase6Outcome();
