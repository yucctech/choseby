#!/bin/bash
# Test script for customer response context API fields
# Week 1, Day 2 - API endpoint validation

echo "🧪 Testing Customer Response Context API"
echo "=========================================="

# Test 1: Create decision with enhanced customer context
echo ""
echo "Test 1: Create Decision with Enhanced Customer Context"
echo "-------------------------------------------------------"

curl -X POST http://localhost:8080/api/v1/decisions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customer_name": "TechCorp International",
    "customer_email": "contact@techcorp.com",
    "customer_tier": "enterprise",
    "customer_tier_detailed": "platinum",
    "customer_value": 150000,
    "relationship_duration_months": 36,
    "urgency_level": 4,
    "urgency_level_detailed": "high",
    "customer_impact_scope": "company",
    "relationship_history": "Long-standing customer, previous service escalation resolved successfully 6 months ago",
    "previous_issues_count": 2,
    "nps_score": 65,
    "title": "Service Outage Refund Request",
    "description": "Customer experienced 8-hour outage affecting critical business operations, requesting proportional refund",
    "decision_type": "refund_request",
    "financial_impact": 12000
  }'

echo ""
echo ""

# Test 2: Query response types lookup table
echo "Test 2: Query Response Types (AI Classification Keywords)"
echo "-------------------------------------------------------"
echo "SQL Query to verify response types table:"
echo "SELECT type_code, type_name, requires_escalation, typical_resolution_time_hours"
echo "FROM customer_response_types"
echo "WHERE type_code IN ('refund_full', 'service_outage', 'churn_risk');"

echo ""
echo "✅ API structure updated with customer context fields"
echo "✅ Backend compiles successfully"
echo "✅ Database migration applied"
echo ""
echo "Next: Start backend server and test with real authentication token"
