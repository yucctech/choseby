const API_URL = 'http://localhost:8080/api/v1';

async function verifySpec() {
  const token = await (await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@choseby.com', password: 'demo123' })
  })).json().then(d => d.token);

  const response = await fetch(`${API_URL}/analytics/dashboard?period=30d`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();

  console.log('\n✅ API SPECIFICATION COMPLIANCE:\n');

  const checks = [
    { name: 'period field exists', pass: typeof data.analytics?.period === 'string' },
    { name: 'total_decisions exists', pass: typeof data.analytics?.total_decisions === 'number' },
    { name: 'average_resolution_time_hours exists', pass: data.analytics.hasOwnProperty('average_resolution_time_hours') },
    { name: 'customer_satisfaction_avg exists', pass: data.analytics.hasOwnProperty('customer_satisfaction_avg') },
    { name: 'decision_types is object', pass: typeof data.analytics?.decision_types === 'object' },
    { name: 'urgency_breakdown is object', pass: typeof data.analytics?.urgency_breakdown === 'object' }
  ];

  checks.forEach(c => console.log(`${c.pass ? '✅' : '❌'} ${c.name}`));

  const allPass = checks.every(c => c.pass);
  console.log(allPass ? '\n🎉 Specification compliance verified!\n' : '\n❌ Some checks failed\n');
}

verifySpec().catch(console.error);
