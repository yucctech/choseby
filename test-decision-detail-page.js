const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDIiLCJlbWFpbCI6IiIsInJvbGUiOiJjdXN0b21lcl9zdWNjZXNzX21hbmFnZXIiLCJ0ZWFtX2lkIjoiIiwiZXhwIjoxNzU5OTMxNjMyLCJpYXQiOjE3NTk5MjgwMzJ9.Mh_dCAUifamSzq3X_jkJNFSdGorKu_MkQhl1n6MgoVg';

async function testDetailPageData() {
  console.log('Testing decision detail page data structure...\n');

  // Get a decision ID from list
  const listResponse = await fetch('http://localhost:8080/api/v1/decisions?limit=1', {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });

  const listData = await listResponse.json();
  if (!listData.decisions || listData.decisions.length === 0) {
    console.log('❌ No decisions found');
    return;
  }

  const decisionId = listData.decisions[0].id;
  console.log(`✅ Found decision ID: ${decisionId}\n`);

  // Get decision detail
  const detailResponse = await fetch(`http://localhost:8080/api/v1/decisions/${decisionId}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });

  const detailData = await detailResponse.json();
  console.log('Decision Detail Response Structure:');
  console.log(JSON.stringify(detailData, null, 2));

  // Validate structure for frontend
  console.log('\n✅ Validation:');
  console.log(`  - Has decision object: ${!!detailData.decision}`);
  console.log(`  - Has criteria array: ${Array.isArray(detailData.criteria)}`);
  console.log(`  - Has options array: ${Array.isArray(detailData.options)}`);
  console.log(`  - Has evaluations: ${detailData.evaluations !== undefined}`);

  if (detailData.decision) {
    console.log(`\n✅ Decision Data:`);
    console.log(`  - Title: ${detailData.decision.title}`);
    console.log(`  - Customer: ${detailData.decision.customer_name}`);
    console.log(`  - Tier: ${detailData.decision.customer_tier}`);
    console.log(`  - Status: ${detailData.decision.status}`);
    console.log(`  - Current Phase: ${detailData.decision.current_phase}`);
  }
}

testDetailPageData().catch(console.error);
