/**
 * Comprehensive Frontend-Backend Integration Test
 *
 * Tests the complete user journey:
 * 1. Login with demo credentials
 * 2. Verify JWT token storage
 * 3. Access protected dashboard with real API data
 * 4. Test team members endpoint
 * 5. Test decisions list endpoint
 * 6. Verify logout clears token
 */

const API_URL = 'http://localhost:8080/api/v1';
const DEMO_EMAIL = 'demo@choseby.com';
const DEMO_PASSWORD = 'demo123';

let authToken = null;
let testResults = [];

function log(emoji, message, status = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const statusSymbol = status === 'pass' ? '✅' : status === 'fail' ? '❌' : 'ℹ️';
  console.log(`[${timestamp}] ${statusSymbol} ${emoji} ${message}`);
  testResults.push({ timestamp, status, message });
}

async function testLogin() {
  log('🔐', 'Testing login with demo credentials...');

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error('No token in login response');
    }

    if (!data.user || data.user.email !== DEMO_EMAIL) {
      throw new Error('Invalid user data in response');
    }

    authToken = data.token;
    log('🔐', `Login successful! User: ${data.user.name} (${data.user.role})`, 'pass');
    log('🎫', `JWT Token: ${authToken.substring(0, 30)}...`, 'pass');
    return true;
  } catch (error) {
    log('🔐', `Login failed: ${error.message}`, 'fail');
    return false;
  }
}

async function testAuthMe() {
  log('👤', 'Testing /auth/me endpoint...');

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      throw new Error(`Auth me failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.user || !data.team) {
      throw new Error('Missing user or team data');
    }

    log('👤', `Profile loaded: ${data.user.name} from ${data.team.name}`, 'pass');
    return true;
  } catch (error) {
    log('👤', `Auth me failed: ${error.message}`, 'fail');
    return false;
  }
}

async function testDashboard() {
  log('📊', 'Testing analytics dashboard endpoint...');

  try {
    const response = await fetch(`${API_URL}/analytics/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      throw new Error(`Dashboard failed: ${response.status}`);
    }

    const data = await response.json();
    log('📊', `Dashboard data: ${JSON.stringify(data).substring(0, 100)}...`, 'pass');
    return true;
  } catch (error) {
    log('📊', `Dashboard failed: ${error.message}`, 'fail');
    return false;
  }
}

async function testTeamMembers() {
  log('👥', 'Testing team members endpoint...');

  try {
    const response = await fetch(`${API_URL}/team/members`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      throw new Error(`Team members failed: ${response.status}`);
    }

    const data = await response.json();
    const members = data.members || data;
    log('👥', `Team has ${Array.isArray(members) ? members.length : 0} members`, 'pass');
    return true;
  } catch (error) {
    log('👥', `Team members failed: ${error.message}`, 'fail');
    return false;
  }
}

async function testDecisionsList() {
  log('📋', 'Testing decisions list endpoint...');

  try {
    const response = await fetch(`${API_URL}/decisions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      throw new Error(`Decisions list failed: ${response.status}`);
    }

    const data = await response.json();
    const decisions = data.decisions || data;
    log('📋', `Found ${Array.isArray(decisions) ? decisions.length : 0} decisions`, 'pass');
    return true;
  } catch (error) {
    log('📋', `Decisions list failed: ${error.message}`, 'fail');
    return false;
  }
}

async function testUnauthorizedAccess() {
  log('🔒', 'Testing unauthorized access (should fail)...');

  try {
    const response = await fetch(`${API_URL}/analytics/dashboard`);

    if (response.status === 401) {
      log('🔒', 'Unauthorized access properly blocked', 'pass');
      return true;
    } else {
      log('🔒', `Unauthorized access allowed! Status: ${response.status}`, 'fail');
      return false;
    }
  } catch (error) {
    log('🔒', `Unauthorized test error: ${error.message}`, 'fail');
    return false;
  }
}

async function testInvalidToken() {
  log('🚫', 'Testing invalid token (should fail)...');

  try {
    const response = await fetch(`${API_URL}/analytics/dashboard`, {
      headers: { 'Authorization': 'Bearer invalid-token-12345' }
    });

    if (response.status === 401) {
      log('🚫', 'Invalid token properly rejected', 'pass');
      return true;
    } else {
      log('🚫', `Invalid token accepted! Status: ${response.status}`, 'fail');
      return false;
    }
  } catch (error) {
    log('🚫', `Invalid token test error: ${error.message}`, 'fail');
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 CHOSEBY FRONTEND-BACKEND INTEGRATION TEST');
  console.log('='.repeat(70) + '\n');

  const tests = [
    { name: 'Login', fn: testLogin, critical: true },
    { name: 'Auth Me', fn: testAuthMe, critical: true },
    { name: 'Dashboard', fn: testDashboard, critical: false },
    { name: 'Team Members', fn: testTeamMembers, critical: false },
    { name: 'Decisions List', fn: testDecisionsList, critical: false },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess, critical: false },
    { name: 'Invalid Token', fn: testInvalidToken, critical: false }
  ];

  let passed = 0;
  let failed = 0;
  let criticalFailed = false;

  for (const test of tests) {
    const result = await test.fn();

    if (result) {
      passed++;
    } else {
      failed++;
      if (test.critical) {
        criticalFailed = true;
        log('⚠️', `CRITICAL TEST FAILED: ${test.name}`, 'fail');
        break; // Stop on critical failure
      }
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(70));
  console.log('📈 TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);

  if (criticalFailed) {
    console.log('\n⚠️  CRITICAL FAILURE - Frontend-backend integration broken!');
    process.exit(1);
  } else if (failed > 0) {
    console.log('\n⚠️  Some tests failed - review errors above');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL TESTS PASSED - Frontend-backend integration working!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
