const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDIiLCJlbWFpbCI6IiIsInJvbGUiOiJjdXN0b21lcl9zdWNjZXNzX21hbmFnZXIiLCJ0ZWFtX2lkIjoiIiwiZXhwIjoxNzU5OTMxNjMyLCJpYXQiOjE3NTk5MjgwMzJ9.Mh_dCAUifamSzq3X_jkJNFSdGorKu_MkQhl1n6MgoVg';

async function testDecisionsList() {
  console.log('Testing GET /api/v1/decisions (list)...\n');

  const response = await fetch('http://localhost:8080/api/v1/decisions?limit=5', {
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    }
  });

  console.log(`Status: ${response.status}`);
  const data = await response.json();
  console.log(`Total decisions: ${data.total}`);
  console.log(`Returned: ${data.decisions?.length || 0} decisions\n`);

  if (data.decisions && data.decisions.length > 0) {
    console.log('First decision:');
    console.log(JSON.stringify(data.decisions[0], null, 2));
  }
}

testDecisionsList().catch(console.error);
