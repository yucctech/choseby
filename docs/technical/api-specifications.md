# Customer Response Platform: API Specifications
## Go/Gin Backend Implementation Guide

### 🎯 **OVERVIEW**
Complete API specifications for Customer Response Decision Intelligence platform. Ready for immediate implementation by Claude Code using Go/Gin framework.

**Base URL**: `http://localhost:8080/api/v1`
**Authentication**: JWT Bearer Token
**Response Format**: JSON

---

## 🔐 **AUTHENTICATION ENDPOINTS**

### POST /auth/register
Register new team and team member.

**Request Body**:
```json
{
  "email": "sarah@techcorp.com",
  "name": "Sarah Johnson",
  "password": "securepassword123",
  "team_name": "Customer Success Team",
  "company": "TechCorp Inc",
  "role": "customer_success_manager"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "sarah@techcorp.com",
    "name": "Sarah Johnson",
    "role": "customer_success_manager",
    "team_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "team": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Customer Success Team",
    "company_name": "TechCorp Inc"
  },
  "expires_at": "2024-01-15T12:00:00Z"
}
```

### POST /auth/login
Authenticate existing team member.

**Request Body**:
```json
{
  "email": "sarah@techcorp.com",
  "password": "securepassword123"
}
```

**Response (200)**: Same as register

**Error Responses**:
- `400`: Invalid input
- `401`: Invalid credentials
- `500`: Internal server error

---

## 📋 **CUSTOMER DECISION ENDPOINTS**

### POST /decisions
Create new customer response decision.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "customer_name": "ABC Corporation",
  "customer_email": "john@abccorp.com",
  "customer_tier": "enterprise",
  "customer_value": 120000.00,
  "relationship_duration_months": 18,
  "title": "Refund Request for Service Outage",
  "description": "Customer demanding full refund due to 8-hour service outage affecting their business operations",
  "decision_type": "refund_request",
  "urgency_level": 4,
  "financial_impact": 10000.00,
  "expected_resolution_date": "2024-01-10T17:00:00Z"
}
```

**Response (201)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "team_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "ABC Corporation",
  "customer_tier": "enterprise",
  "title": "Refund Request for Service Outage",
  "status": "created",
  "current_phase": 1,
  "urgency_level": 4,
  "created_at": "2024-01-08T10:30:00Z"
}
```

### GET /decisions
List team's customer response decisions.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status`: Filter by status (created, team_input, evaluating, resolved, cancelled)
- `urgency`: Filter by urgency level (1-5)
- `limit`: Results per page (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Response (200)**:
```json
{
  "decisions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "customer_name": "ABC Corporation",
      "customer_tier": "enterprise",
      "title": "Refund Request for Service Outage",
      "status": "team_input",
      "urgency_level": 4,
      "created_at": "2024-01-08T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### GET /decisions/:id
Get detailed decision information.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "decision": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "customer_name": "ABC Corporation",
    "customer_email": "john@abccorp.com",
    "customer_tier": "enterprise",
    "customer_value": 120000.00,
    "title": "Refund Request for Service Outage",
    "description": "Customer demanding full refund...",
    "status": "team_input",
    "current_phase": 2,
    "urgency_level": 4,
    "created_at": "2024-01-08T10:30:00Z"
  },
  "criteria": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Customer Satisfaction",
      "description": "Impact on customer happiness and retention",
      "weight": 1.5
    }
  ],
  "options": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "title": "Full Refund",
      "description": "Provide complete refund of $10,000",
      "financial_cost": 10000.00,
      "risk_level": "medium"
    }
  ],
  "evaluations": [
    {
      "option_id": "550e8400-e29b-41d4-a716-446655440030",
      "criteria_id": "550e8400-e29b-41d4-a716-446655440020",
      "score": 8,
      "evaluator_role": "customer_success_manager"
    }
  ]
}
```

### PUT /decisions/:id/criteria
Update decision criteria.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "criteria": [
    {
      "name": "Customer Satisfaction",
      "description": "Impact on customer happiness and retention",
      "weight": 1.5
    },
    {
      "name": "Financial Impact",
      "description": "Cost to company in dollars",
      "weight": 1.0
    },
    {
      "name": "Policy Consistency",
      "description": "Alignment with company policies",
      "weight": 1.2
    }
  ]
}
```

**Response (200)**:
```json
{
  "criteria": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "decision_id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Customer Satisfaction",
      "weight": 1.5
    }
  ]
}
```

### PUT /decisions/:id/options
Update response options.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "options": [
    {
      "title": "Full Refund",
      "description": "Provide complete refund of $10,000",
      "financial_cost": 10000.00,
      "implementation_effort": "low",
      "risk_level": "medium"
    },
    {
      "title": "Partial Refund + Service Credit",
      "description": "50% refund plus additional service credits",
      "financial_cost": 5000.00,
      "implementation_effort": "medium",
      "risk_level": "low"
    }
  ]
}
```

**Response (200)**:
```json
{
  "options": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "title": "Full Refund",
      "financial_cost": 10000.00,
      "risk_level": "medium"
    }
  ]
}
```

---

## 📊 **EVALUATION ENDPOINTS**

### POST /decisions/:id/evaluate
Submit team member evaluation.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "evaluations": [
    {
      "option_id": "550e8400-e29b-41d4-a716-446655440030",
      "criteria_id": "550e8400-e29b-41d4-a716-446655440020",
      "score": 8,
      "confidence": 4,
      "comment": "High customer satisfaction but significant cost"
    },
    {
      "option_id": "550e8400-e29b-41d4-a716-446655440031",
      "criteria_id": "550e8400-e29b-41d4-a716-446655440020",
      "score": 7,
      "confidence": 5,
      "comment": "Good balance of satisfaction and cost"
    }
  ]
}
```

**Response (200)**:
```json
{
  "message": "Evaluation submitted successfully",
  "evaluations_count": 2
}
```

### GET /decisions/:id/results
Get evaluation results and analysis.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "option_scores": [
    {
      "option_id": "550e8400-e29b-41d4-a716-446655440030",
      "option_title": "Full Refund",
      "average_score": 7.8,
      "weighted_score": 8.2,
      "evaluators": 3,
      "consensus": 0.85,
      "conflict_level": "low"
    },
    {
      "option_id": "550e8400-e29b-41d4-a716-446655440031",
      "option_title": "Partial Refund + Service Credit",
      "average_score": 8.1,
      "weighted_score": 8.4,
      "evaluators": 3,
      "consensus": 0.92,
      "conflict_level": "none"
    }
  ],
  "participation_rate": 0.75,
  "completed_by": ["customer_success_manager", "support_manager", "account_manager"],
  "pending_from": ["legal_compliance"],
  "recommended_option": "550e8400-e29b-41d4-a716-446655440031",
  "team_consensus": 0.88
}
```

---

## 🤖 **AI INTEGRATION ENDPOINTS**

### POST /ai/classify
Get AI classification and recommendations.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "customer_context": {
    "name": "ABC Corporation",
    "tier": "enterprise",
    "value": 120000.00,
    "relationship_duration_months": 18
  },
  "issue_description": "Customer demanding full refund due to 8-hour service outage affecting their business operations",
  "team_roles": ["customer_success_manager", "support_manager", "account_manager", "legal_compliance"]
}
```

**Response (200)**:
```json
{
  "classification": {
    "decision_type": "refund_request",
    "urgency_level": 4,
    "confidence_score": 0.89,
    "risk_factors": [
      "High-value customer retention risk",
      "Potential precedent for similar cases",
      "Service level agreement implications"
    ]
  },
  "recommended_stakeholders": [
    {
      "role": "customer_success_manager",
      "weight": 0.4,
      "reasoning": "Primary account relationship and retention responsibility"
    },
    {
      "role": "legal_compliance",
      "weight": 0.3,
      "reasoning": "Contract terms and refund policy interpretation"
    },
    {
      "role": "support_manager",
      "weight": 0.2,
      "reasoning": "Technical context and service issue expertise"
    }
  ],
  "suggested_criteria": [
    {
      "name": "Customer Retention Impact",
      "description": "Risk of customer churn and future revenue loss",
      "weight": 1.8
    },
    {
      "name": "Policy Consistency",
      "description": "Alignment with refund policies and precedent",
      "weight": 1.2
    },
    {
      "name": "Financial Cost",
      "description": "Direct financial impact to company",
      "weight": 1.0
    }
  ]
}
```

### POST /ai/generate-options
Generate AI-powered response options.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "decision_context": {
    "customer_name": "ABC Corporation",
    "customer_tier": "enterprise",
    "decision_type": "refund_request",
    "description": "Customer demanding full refund...",
    "financial_impact": 10000.00
  },
  "criteria": [
    {
      "name": "Customer Satisfaction",
      "weight": 1.5
    },
    {
      "name": "Financial Impact",
      "weight": 1.0
    }
  ]
}
```

**Response (200)**:
```json
{
  "options": [
    {
      "title": "Full Refund with Apology",
      "description": "Provide complete $10,000 refund with formal apology and service improvement commitment",
      "financial_cost": 10000.00,
      "implementation_effort": "low",
      "risk_level": "low",
      "reasoning": "Maintains customer relationship but sets expensive precedent",
      "similar_cases": ["TechStart Inc - similar outage resolved with full refund"]
    },
    {
      "title": "Partial Refund + Service Credits",
      "description": "50% monetary refund ($5,000) plus $7,500 in service credits for future use",
      "financial_cost": 5000.00,
      "implementation_effort": "medium",
      "risk_level": "low",
      "reasoning": "Balances customer satisfaction with cost control and encourages continued relationship",
      "similar_cases": ["Enterprise Corp - billing dispute resolved with partial refund and credits"]
    }
  ]
}
```

---

## 👥 **TEAM MANAGEMENT ENDPOINTS**

### GET /team/members
Get team member list.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Sarah Johnson",
      "email": "sarah@techcorp.com",
      "role": "customer_success_manager",
      "is_active": true
    }
  ]
}
```

### POST /team/invite
Invite new team member.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "email": "newmember@techcorp.com",
  "name": "New Member",
  "role": "support_manager"
}
```

**Response (201)**:
```json
{
  "message": "Invitation sent successfully",
  "invite_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 📈 **ANALYTICS ENDPOINTS**

### GET /analytics/dashboard
Get team performance dashboard data.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `period`: Time period (7d, 30d, 90d)

**Response (200)**:
```json
{
  "period": "30d",
  "total_decisions": 24,
  "average_resolution_time_hours": 18.5,
  "customer_satisfaction_avg": 4.2,
  "decision_types": {
    "refund_request": 8,
    "billing_dispute": 6,
    "service_escalation": 10
  },
  "urgency_breakdown": {
    "1": 2,
    "2": 6,
    "3": 10,
    "4": 5,
    "5": 1
  }
}
```

---

## ⚠️ **ERROR HANDLING**

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

**Status**: Ready for Claude Code implementation
**Next**: Frontend component specifications