const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDIiLCJlbWFpbCI6IiIsInJvbGUiOiJjdXN0b21lcl9zdWNjZXNzX21hbmFnZXIiLCJ0ZWFtX2lkIjoiIiwiZXhwIjoxNzU5OTMxNjMyLCJpYXQiOjE3NTk5MjgwMzJ9.Mh_dCAUifamSzq3X_jkJNFSdGorKu_MkQhl1n6MgoVg';
const DECISION_ID = '8014305e-7a48-4e7a-ab22-59eb9da927cc';

async function testDecisionDetail() {
  console.log('Testing GET /api/v1/decisions/:id...\n');

  const response = await fetch(`http://localhost:8080/api/v1/decisions/${DECISION_ID}`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    }
  });

  console.log(`Status: ${response.status}`);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testDecisionDetail().catch(console.error);
