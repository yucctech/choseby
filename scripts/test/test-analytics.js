/**
 * Test Analytics Dashboard Endpoint
 * Tests the analytics API with the outcome data from Phase 6
 */

const API_URL = 'http://localhost:8080/api/v1';
const DEMO_EMAIL = 'demo@choseby.com';
const DEMO_PASSWORD = 'demo123';

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

async function testAnalyticsDashboard(period) {
  console.log(`📊 Testing analytics dashboard (${period})...`);

  const response = await fetch(`${API_URL}/analytics/dashboard?period=${period}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Analytics request failed: ${response.status} - ${error}`);
  }

  const data = await response.json();

  console.log('\n' + '='.repeat(70));
  console.log(`📈 ANALYTICS DASHBOARD (${period.toUpperCase()})`);
  console.log('='.repeat(70));

  // Summary Metrics
  console.log('\n📊 SUMMARY METRICS:');
  console.log(`   Total Decisions: ${data.summary?.total_decisions || 0}`);
  console.log(`   Avg Resolution Time: ${data.summary?.avg_resolution_hours?.toFixed(1) || 0} hours`);
  console.log(`   Avg Customer Satisfaction: ${data.summary?.avg_satisfaction?.toFixed(1) || 0}/5`);
  console.log(`   Team Participation Rate: ${data.summary?.participation_rate?.toFixed(1) || 0}%`);

  // Decision Types
  if (data.analytics?.decision_types && Object.keys(data.analytics.decision_types).length > 0) {
    console.log('\n📋 DECISION TYPES:');
    Object.entries(data.analytics.decision_types).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} decisions`);
    });
  }

  // Urgency Breakdown
  if (data.analytics?.urgency_breakdown && Object.keys(data.analytics.urgency_breakdown).length > 0) {
    console.log('\n🚨 URGENCY BREAKDOWN:');
    Object.entries(data.analytics.urgency_breakdown).forEach(([level, count]) => {
      const labels = {
        '1': 'Very Low',
        '2': 'Low',
        '3': 'Medium',
        '4': 'High',
        '5': 'Critical'
      };
      console.log(`   Level ${level} (${labels[level]}): ${count} decisions`);
    });
  }

  // Recent Activity
  if (data.recent_activity && data.recent_activity.length > 0) {
    console.log('\n🕐 RECENT DECISIONS:');
    data.recent_activity.slice(0, 5).forEach(decision => {
      console.log(`   - ${decision.title} (${decision.customer_name}) - Level ${decision.urgency_level}`);
    });
  }

  // Customer Tiers
  if (data.customer_tiers && data.customer_tiers.length > 0) {
    console.log('\n👥 CUSTOMER TIERS:');
    data.customer_tiers.forEach(tier => {
      console.log(`   ${tier.tier}: ${tier.count} decisions`);
    });
  }

  // Weekly Trends
  if (data.weekly_trends && data.weekly_trends.length > 0) {
    console.log('\n📈 WEEKLY TRENDS:');
    data.weekly_trends.slice(0, 3).forEach(week => {
      console.log(`   Week of ${week.week}: ${week.decision_count} decisions, ` +
                  `${week.avg_resolution_time.toFixed(1)}h avg resolution, ` +
                  `${week.avg_satisfaction.toFixed(1)} avg satisfaction`);
    });
  }

  // Team Efficiency
  if (data.team_efficiency) {
    console.log('\n⚡ TEAM EFFICIENCY:');
    console.log(`   Avg Evaluation Time: ${data.team_efficiency.avg_evaluation_time.toFixed(1)} hours`);
    console.log(`   Participation Rate: ${data.team_efficiency.participation_rate.toFixed(1)}%`);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  return data;
}

async function validateAnalyticsData(data) {
  console.log('✅ VALIDATION CHECKS:');

  const checks = [
    {
      test: data.summary !== undefined,
      name: 'Summary data exists'
    },
    {
      test: typeof data.summary?.total_decisions === 'number',
      name: 'Total decisions is a number'
    },
    {
      test: data.analytics !== undefined,
      name: 'Analytics data exists'
    },
    {
      test: data.analytics?.decision_types !== undefined,
      name: 'Decision types breakdown exists'
    },
    {
      test: data.analytics?.urgency_breakdown !== undefined,
      name: 'Urgency breakdown exists'
    },
    {
      test: Array.isArray(data.recent_activity),
      name: 'Recent activity is an array'
    },
    {
      test: Array.isArray(data.customer_tiers),
      name: 'Customer tiers is an array'
    },
    {
      test: Array.isArray(data.weekly_trends),
      name: 'Weekly trends is an array'
    },
    {
      test: data.team_efficiency !== undefined,
      name: 'Team efficiency metrics exist'
    }
  ];

  checks.forEach(({ test, name }) => {
    console.log(`${test ? '✅' : '❌'} ${name}`);
  });

  const allPassed = checks.every(c => c.test);

  console.log('\n' + '='.repeat(70));
  if (allPassed) {
    console.log('🎉 ALL ANALYTICS VALIDATION CHECKS PASSED!');
    console.log('   - Dashboard endpoint working correctly');
    console.log('   - All expected data fields present');
    console.log('   - Data structure matches specification');
  } else {
    console.log('❌ SOME ANALYTICS CHECKS FAILED');
  }
  console.log('='.repeat(70) + '\n');

  return allPassed;
}

async function testAllPeriods() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 ANALYTICS DASHBOARD TEST SUITE');
  console.log('='.repeat(70) + '\n');

  try {
    await login();

    // Test all periods
    console.log('📅 Testing all period filters...\n');

    const data30d = await testAnalyticsDashboard('30d');
    await testAnalyticsDashboard('7d');
    await testAnalyticsDashboard('90d');

    // Validate data structure
    await validateAnalyticsData(data30d);

    console.log('🌐 View analytics dashboard: http://localhost:3000/analytics');
    console.log();

  } catch (error) {
    console.error('\n❌ Analytics test failed:', error.message);
    process.exit(1);
  }
}

testAllPeriods();
