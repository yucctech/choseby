const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDIiLCJlbWFpbCI6IiIsInJvbGUiOiJjdXN0b21lcl9zdWNjZXNzX21hbmFnZXIiLCJ0ZWFtX2lkIjoiIiwiZXhwIjoxNzU5OTMxNjMyLCJpYXQiOjE3NTk5MjgwMzJ9.Mh_dCAUifamSzq3X_jkJNFSdGorKu_MkQhl1n6MgoVg';
const DECISION_ID = 'edeff447-f21d-460a-8a02-41871a82403a'; // Latest test decision with evaluations

async function testResults() {
  console.log('Testing results endpoint...\n');

  const response = await fetch(`http://localhost:8080/api/v1/decisions/${DECISION_ID}/results`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testResults().catch(console.error);
