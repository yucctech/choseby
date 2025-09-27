# Customer Response API Specifications
## Modifications for Customer Response Decision Intelligence

### Overview

This document specifies the API modifications needed to adapt the existing Choseby platform from healthcare decision workflows to Customer Response Decision Intelligence. The design leverages 95% of the existing backend infrastructure while specializing endpoints for customer response workflows.

**Core Principle**: Transform "How should we respond to this customer?" from 3-5 day email threads into same-day structured team decisions with AI intelligence.

---

## Modified Base Configuration

### Base URLs (Unchanged)
- **Production**: `https://api.choseby.com/v1`
- **Staging**: `https://staging-api.choseby.com/v1`
- **Development**: `https://localhost:3000/v1`

### Authentication & Security (Reused)
- **JWT Bearer Tokens**: Existing authentication system
- **Rate Limiting**: 1000 requests per hour per team (sufficient for customer response frequency)
- **Data Retention**: Modified to 5-year business record retention vs 7-year healthcare compliance
- **Audit Trails**: Existing system supports customer response decision tracking

---

## Core Resource Modifications

### Teams Resource (Minimal Changes)

**Existing Structure**: Healthcare teams with role-based permissions
**Customer Response Adaptation**: 
- Replace healthcare roles with customer-facing team roles
- Maintain existing team management and permission structure
- Add customer response team templates

```yaml
CustomerResponseTeam:
  roles:
    - "Customer Success Manager" (was "Clinical Lead")
    - "Support Manager" (was "Nurse Manager") 
    - "Account Manager" (was "Administrator")
    - "Sales Manager" (was "Department Head")
    - "Legal/Compliance" (was "Compliance Officer")
    - "Product Manager" (was "Quality Assurance")
```

### Decisions Resource (Enhanced for Customer Context)

**New Customer Context Fields**:
```yaml
CustomerResponseDecision:
  extends: Decision
  additionalFields:
    customerContext:
      customerId: string
      customerTier: enum [enterprise, pro, standard, basic]
      customerValue: number # annual contract value
      relationshipDuration: number # months as customer
      supportLevel: enum [premium, standard, basic]
      escalationLevel: enum [low, medium, high, critical]
    
    issueDetails:
      issueType: enum [refund, policy_exception, service_issue, billing_dispute, feature_request, bug_report, account_access]
      urgency: enum [low, medium, high, critical]
      financialImpact: number # estimated revenue impact
      contractualImplications: boolean
      precedentRisk: enum [none, low, medium, high]
    
    responseContext:
      previousEscalations: number
      similarIssuesHandled: number
      customerSatisfactionHistory: number # 1-5 scale
      preferredCommunicationChannel: enum [email, phone, chat, meeting]
      
    aiAnalysis:
      classification: string # AI-determined issue classification
      suggestedStakeholders: array # AI-recommended team members
      riskFactors: array # AI-identified risks
      similarCases: array # historical similar decisions
```

---

## AI Integration Endpoints

### DeepSeek AI Integration

**New Endpoints for Customer Response Intelligence**:

#### POST `/decisions/{id}/ai-classify`
Classify customer issue and recommend stakeholders using DeepSeek AI.

**Request Body**:
```json
{
  "customerIssue": "Customer demanding full refund for service issue after 6 months",
  "customerContext": {
    "tier": "enterprise",
    "value": 120000,
    "relationshipDuration": 18
  },
  "teamMembers": [
    {"role": "Customer Success Manager", "expertise": ["enterprise_accounts", "service_issues"]},
    {"role": "Legal", "expertise": ["contracts", "refunds"]}
  ]
}
```

**Response**:
```json
{
  "classification": {
    "primaryType": "refund_request",
    "subType": "service_issue_escalation", 
    "confidence": 0.89,
    "urgency": "high",
    "complexity": "medium"
  },
  "stakeholderRecommendations": [
    {"role": "Customer Success Manager", "weight": 0.4, "reasoning": "Primary account relationship"},
    {"role": "Legal", "weight": 0.3, "reasoning": "Contract terms evaluation"},
    {"role": "Support Manager", "weight": 0.2, "reasoning": "Service issue expertise"},
    {"role": "Finance", "weight": 0.1, "reasoning": "Financial impact assessment"}
  ],
  "riskFactors": [
    "High-value customer retention risk",
    "Potential precedent for similar cases",
    "Contract term interpretation required"
  ],
  "suggestedCriteria": [
    "Customer retention impact",
    "Policy consistency",
    "Financial cost",
    "Precedent implications"
  ]
}
```

#### POST `/decisions/{id}/generate-response-draft`
Generate AI-powered customer response draft based on team decision.

**Request Body**:
```json
{
  "decisionOutcome": {
    "selectedOption": "Partial refund with service credit",
    "reasoning": "Maintains policy consistency while preserving customer relationship",
    "teamConsensus": 0.85
  },
  "customerContext": {...},
  "communicationPreferences": {
    "tone": "professional_empathetic",
    "channel": "email",
    "urgency": "same_day"
  }
}
```

**Response**:
```json
{
  "responseDraft": "Dear [Customer Name],\n\nThank you for bringing this service issue to our attention...",
  "keyPoints": [
    "Acknowledges service issue impact",
    "Explains resolution rationale", 
    "Offers specific compensation",
    "Reinforces relationship value"
  ],
  "tone": "professional_empathetic",
  "estimatedSatisfactionImpact": "positive",
  "followUpRecommendations": [
    "Schedule follow-up call in 1 week",
    "Monitor account health metrics",
    "Document case for future reference"
  ]
}
```

---

## Workflow Modifications

### Customer Response Workflow Types

**1. Emergency Customer Response** (Critical escalations)
- Customer threatening to churn immediately
- Public social media complaints
- Legal threats or regulatory issues
- Bypass normal process, immediate stakeholder notification
- Retrospective documentation within 24 hours

**2. Express Customer Response** (Standard urgent issues)
- Refund requests, service issues, billing disputes
- 3-phase process: Define & Evaluate → AI Analysis & Team Input → Response Generation
- 24-hour resolution target
- Stakeholder weighting based on issue type

**3. Full Customer Response Workflow** (Complex or high-impact issues)
- Enterprise customer issues, precedent-setting decisions
- Complete 6-phase DECIDE methodology
- Anonymous evaluation with conflict detection
- Cross-department coordination required

### Modified Phase Definitions

**Phase 1: Define Customer Issue** (was "Define Problem")
- Customer context capture
- Issue classification with AI assistance
- Impact assessment (financial, relationship, precedent)
- Stakeholder identification

**Phase 2: Establish Response Criteria** (was "Establish Criteria")
- Customer satisfaction impact
- Policy consistency requirements
- Financial implications
- Precedent and risk factors
- Relationship preservation priorities

**Phase 3: Consider Response Options** (was "Consider Options")
- AI-suggested response approaches
- Historical similar case analysis
- Legal and policy compliance review
- Financial impact modeling

**Phase 4: Evaluate Anonymously** (unchanged system)
- Anonymous team evaluation of response options
- Conflict detection for disagreements
- Role-based weighting by issue type

**Phase 5: Develop Response Plan** (was "Develop Action Plan")
- AI-generated response draft
- Communication channel selection
- Timeline and follow-up planning
- Escalation procedures if needed

**Phase 6: Monitor Customer Outcome** (was "Evaluate & Monitor")
- Customer satisfaction tracking
- Response effectiveness measurement
- Case outcome documentation
- AI learning feedback integration

---

## Database Schema Extensions

### New Tables for Customer Response Context

```sql
-- Customer Response Decision Context
CREATE TABLE customer_response_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id),
    customer_id VARCHAR(255),
    customer_tier customer_tier_enum,
    customer_value DECIMAL(12,2),
    relationship_duration INTEGER, -- months
    support_level support_level_enum,
    escalation_level urgency_enum,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Issue Classification and Details  
CREATE TABLE issue_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id),
    issue_type issue_type_enum,
    urgency urgency_enum,
    financial_impact DECIMAL(12,2),
    contractual_implications BOOLEAN DEFAULT FALSE,
    precedent_risk risk_level_enum,
    previous_escalations INTEGER DEFAULT 0,
    similar_issues_handled INTEGER DEFAULT 0,
    customer_satisfaction_history DECIMAL(3,2), -- 1.00 to 5.00
    preferred_communication_channel channel_enum,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Analysis Results
CREATE TABLE ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id),
    classification JSONB, -- AI classification details
    suggested_stakeholders JSONB, -- recommended team members with weights
    risk_factors TEXT[],
    similar_cases JSONB, -- historical similar decisions
    confidence_score DECIMAL(4,3), -- 0.000 to 1.000
    created_at TIMESTAMP DEFAULT NOW()
);

-- Response Drafts and Customer Communication
CREATE TABLE response_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id),
    draft_content TEXT NOT NULL,
    tone VARCHAR(100),
    key_points TEXT[],
    estimated_satisfaction_impact satisfaction_impact_enum,
    follow_up_recommendations TEXT[],
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Response Outcomes
CREATE TABLE customer_response_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id),
    response_sent_at TIMESTAMP,
    customer_satisfaction_score DECIMAL(3,2), -- 1.00 to 5.00
    resolution_time_hours INTEGER,
    escalation_occurred BOOLEAN DEFAULT FALSE,
    customer_retained BOOLEAN,
    follow_up_required BOOLEAN DEFAULT FALSE,
    lessons_learned TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enum Type Definitions

```sql
CREATE TYPE customer_tier_enum AS ENUM ('enterprise', 'pro', 'standard', 'basic');
CREATE TYPE support_level_enum AS ENUM ('premium', 'standard', 'basic');
CREATE TYPE issue_type_enum AS ENUM ('refund', 'policy_exception', 'service_issue', 'billing_dispute', 'feature_request', 'bug_report', 'account_access');
CREATE TYPE urgency_enum AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE risk_level_enum AS ENUM ('none', 'low', 'medium', 'high');
CREATE TYPE channel_enum AS ENUM ('email', 'phone', 'chat', 'meeting', 'social_media');
CREATE TYPE satisfaction_impact_enum AS ENUM ('very_negative', 'negative', 'neutral', 'positive', 'very_positive');
```

---

## Integration Modifications

### Existing Integrations (Minimal Changes)
- **Authentication**: Reuse existing JWT system
- **Real-time Collaboration**: WebSocket system works for customer response coordination
- **Mobile-First Design**: Existing responsive design suitable for customer response urgency
- **Anonymous Evaluation**: Perfect fit for unbiased customer response decisions

### New Integrations Required

#### Customer Support Systems
```yaml
integrations:
  zendesk:
    - Import customer context from tickets
    - Export decision outcomes back to tickets
    - Sync customer satisfaction scores
  
  salesforce:
    - Customer relationship data integration
    - Account value and tier information
    - Historical interaction tracking
    
  hubspot:
    - Customer lifecycle stage information
    - Communication preference tracking
    - Customer success metrics integration
```

#### AI Services
```yaml
deepseek_ai:
  classification_endpoint: "/v1/chat/completions"
  rate_limits: "1000 requests/hour (free tier)"
  features:
    - Issue classification
    - Stakeholder recommendations  
    - Response draft generation
    - Risk factor analysis
    - Similar case matching
```

---

## Performance Considerations

### Customer Response Speed Requirements
- **Emergency Response**: API response <1 second for critical customer issues
- **Express Response**: Full workflow completion <4 hours
- **AI Classification**: <2 seconds for issue analysis
- **Response Generation**: <5 seconds for draft creation

### Scaling for Customer Response Frequency
- **Decision Volume**: 5-15 customer response decisions per team per week
- **Concurrent Users**: Up to 20 team members active simultaneously
- **AI API Usage**: ~100 AI calls per team per week (within free tier limits)
- **Database Optimization**: Index on customer_id, issue_type, urgency for fast retrieval

---

## Security & Compliance

### Customer Data Protection
- **Customer Information Encryption**: End-to-end encryption for customer data
- **Access Controls**: Role-based access to customer information
- **Audit Trails**: Complete decision history for customer relationship tracking
- **Data Retention**: 5-year business record retention policy

### AI Integration Security
- **API Key Management**: Secure storage of DeepSeek AI credentials
- **Data Minimization**: Only send necessary context to AI services
- **Response Filtering**: Validate AI responses before presenting to users
- **Fallback Systems**: Manual workflow when AI services unavailable

---

## Migration Strategy

### Existing API Compatibility
- **Zero Downtime Migration**: Gradual rollout of customer response features
- **Backward Compatibility**: Maintain existing endpoints during transition
- **Data Migration**: Transform healthcare decisions to customer response format
- **Team Training**: Gradual onboarding from healthcare to customer response workflows

### Development Phases

**Phase 1: Core Adaptations (Week 1)**
- Modify team roles and permissions
- Add customer context fields to decisions
- Implement basic AI classification

**Phase 2: Workflow Specialization (Week 2)**  
- Customer response workflow implementations
- Enhanced AI integration
- Response draft generation

**Phase 3: Integration & Polish (Week 3-4)**
- Customer support system integrations
- Performance optimization
- Mobile experience enhancement

---

## Success Metrics

### API Performance Targets
- **Response Time**: <2 seconds for all customer response endpoints
- **Availability**: >99.9% uptime for customer-facing decisions
- **AI Accuracy**: >85% classification accuracy for customer issues
- **Throughput**: Support 100+ concurrent customer response decisions

### Business Impact Measures
- **Response Time Reduction**: 60%+ improvement (3-5 days → same day)
- **Decision Consistency**: 80%+ alignment with company policies
- **Customer Satisfaction**: 4.5/5 average satisfaction with response quality
- **Team Efficiency**: 75% reduction in coordination time

---

**Status**: Ready for development implementation
**Priority**: Begin with Phase 1 core adaptations to enable customer response workflow testing
**Next**: User flow documentation for customer response decision workflows