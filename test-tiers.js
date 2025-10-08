const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDIiLCJlbWFpbCI6IiIsInJvbGUiOiJjdXN0b21lcl9zdWNjZXNzX21hbmFnZXIiLCJ0ZWFtX2lkIjoiIiwiZXhwIjoxNzU5OTMxNjMyLCJpYXQiOjE3NTk5MjgwMzJ9.Mh_dCAUifamSzq3X_jkJNFSdGorKu_MkQhl1n6MgoVg';

const tiers = ['basic', 'standard', 'premium', 'enterprise'];

async function testTier(tier) {
  const response = await fetch('http://localhost:8080/api/v1/decisions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: `Test ${tier} Tier Decision`,
      description: `Testing ${tier} tier from fixed frontend`,
      customer_name: `${tier} Customer`,
      customer_tier: tier,
      urgency_level: 3,
      decision_type: 'refund_request',
      customer_email: `${tier}@example.com`,
      customer_value: 10000,
      previous_issues_count: 1
    })
  });

  const data = await response.json();
  console.log(`\n${tier.toUpperCase()} Tier - Status: ${response.status}`);
  console.log(JSON.stringify(data, null, 2));
  return response.ok;
}

async function runTests() {
  console.log('Testing all customer tier values...\n');
  console.log('='.repeat(70));

  for (const tier of tiers) {
    await testTier(tier);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(70));
}

runTests().catch(console.error);
