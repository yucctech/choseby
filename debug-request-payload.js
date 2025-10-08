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

  const outcomeData = {
    first_response_at: new Date().toISOString(),
    resolution_at: new Date().toISOString(),
    time_to_first_response_hours: 2,
    time_to_resolution_hours: 6,
    customer_satisfaction_score: 5,
    nps_change: 20,
    customer_retained: true,
    escalation_occurred: false,
    team_consensus_score: 0.93,
    ai_accuracy_validation: true,
    option_effectiveness_rating: 5,
    what_worked_well: 'Quick premium support upgrade was highly effective.',
    what_could_improve: 'Could have communicated timeline expectations earlier.',
    lessons_learned: 'Premium support upgrade more valuable than partial refund.',
    estimated_financial_impact: 4500,
    actual_financial_impact: 5000,
    roi_ratio: 2.4,
    ai_classification_accurate: true,
    response_draft_used: true,
    response_draft_version: 1
  };

  console.log('📤 SENDING PAYLOAD:');
  console.log(JSON.stringify(outcomeData, null, 2));

  const response = await fetch(`${API_URL}/decisions/${DECISION_ID}/outcome`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(outcomeData)
  });

  console.log('\n📥 RESPONSE STATUS:', response.status);
  const result = await response.json();
  console.log('📥 RESPONSE BODY:');
  console.log(JSON.stringify(result, null, 2));
}

debug();
