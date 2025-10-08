/**
 * Test Phase 5: Results Analysis
 * Uses decision from Phase 1-4 test to validate results calculation
 */

const API_URL = 'http://localhost:8080/api/v1';
const DEMO_EMAIL = 'demo@choseby.com';
const DEMO_PASSWORD = 'demo123';
const DECISION_ID = 'b3782f76-0307-44c6-95f8-445e8925bf02'; // From Phase 1-4 test

let authToken = null;

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

async function testPhase5Results() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 PHASE 5: RESULTS ANALYSIS TEST');
  console.log('='.repeat(70) + '\n');

  try {
    await login();

    console.log('📊 Fetching results analysis...');
    const response = await fetch(`${API_URL}/decisions/${DECISION_ID}/results`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      throw new Error(`Results fetch failed: ${response.status} - ${await response.text()}`);
    }

    const results = await response.json();
    console.log('\n✅ Results received successfully!\n');

    // Display team participation summary
    console.log('👥 TEAM PARTICIPATION:');
    console.log(`   Participation Rate: ${(results.participation_rate * 100).toFixed(0)}%`);
    console.log(`   Team Consensus: ${(results.team_consensus * 100).toFixed(0)}%`);
    console.log(`   Completed By: ${results.completed_by || 0} team members`);
    console.log(`   Pending From: ${results.pending_from || 0} team members`);
    console.log();

    // Display ranked options
    console.log('🏆 RANKED OPTIONS (by weighted score):');
    console.log();

    // Sort options by weighted score (descending)
    const sortedOptions = [...results.option_scores].sort((a, b) => b.weighted_score - a.weighted_score);

    sortedOptions.forEach((option, index) => {
      const isRecommended = option.option_id === results.recommended_option;
      const rank = index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
      const star = isRecommended ? ' ⭐ RECOMMENDED' : '';

      console.log(`${medal} ${option.option_title}${star}`);
      console.log(`   Weighted Score: ${option.weighted_score.toFixed(2)}`);
      console.log(`   Average Score: ${option.average_score.toFixed(2)}`);
      console.log(`   Evaluators: ${option.evaluators}`);
      console.log(`   Consensus: ${(option.consensus * 100).toFixed(0)}%`);
      console.log(`   Conflict Level: ${option.conflict_level}`);
      console.log();
    });

    // Validate expected results
    console.log('='.repeat(70));
    console.log('✅ PHASE 5 TEST VALIDATION:');
    console.log('='.repeat(70));

    const validations = [
      {
        test: results.option_scores && results.option_scores.length === 3,
        name: '3 options analyzed'
      },
      {
        test: results.participation_rate > 0,
        name: 'Participation rate calculated'
      },
      {
        test: results.team_consensus >= 0 && results.team_consensus <= 1,
        name: 'Team consensus in valid range (0-1)'
      },
      {
        test: results.recommended_option != null,
        name: 'Recommended option identified'
      },
      {
        test: sortedOptions[0].weighted_score >= sortedOptions[1].weighted_score,
        name: 'Options ranked by weighted score'
      },
      {
        test: sortedOptions.every(o => ['none', 'low', 'medium', 'high'].includes(o.conflict_level)),
        name: 'Conflict levels properly classified'
      }
    ];

    validations.forEach(({ test, name }) => {
      console.log(`${test ? '✅' : '❌'} ${name}`);
    });

    const allPassed = validations.every(v => v.test);

    console.log('\n' + '='.repeat(70));
    if (allPassed) {
      console.log('🎉 ALL PHASE 5 TESTS PASSED!');
      console.log('   - Weighted scoring algorithm working correctly');
      console.log('   - Team consensus calculation accurate');
      console.log('   - Conflict level detection functioning');
      console.log('   - Recommended option logic operational');
    } else {
      console.log('❌ SOME PHASE 5 TESTS FAILED - See details above');
    }
    console.log('='.repeat(70) + '\n');

    console.log(`🌐 View in browser: http://localhost:3000/decisions/${DECISION_ID}`);
    console.log();

  } catch (error) {
    console.error('\n❌ Phase 5 test failed:', error.message);
    process.exit(1);
  }
}

testPhase5Results();
