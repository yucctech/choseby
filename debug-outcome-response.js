const API_URL = 'http://localhost:8080/api/v1';
const DEMO_EMAIL = 'demo@choseby.com';
const DEMO_PASSWORD = 'demo123';
const DECISION_ID = 'b3782f76-0307-44c6-95f8-445e8925bf02';

async function debug() {
  // Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  });
  const { token } = await loginRes.json();

  // Get outcome
  const outcomeRes = await fetch(`${API_URL}/decisions/${DECISION_ID}/outcome`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await outcomeRes.json();
  console.log(JSON.stringify(data, null, 2));
}

debug();
