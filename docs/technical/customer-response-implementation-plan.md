# Technical Implementation Plan: Customer Response Pivot

## Overview
Transform existing healthcare decision platform into Customer Response Decision Intelligence within 8-week MVP timeline.

## Reuse Strategy (95% Backend, 80% Frontend)

### Keep Existing Infrastructure
- Go/Gin API Server (40+ endpoints)
- PostgreSQL schemas (modify context, keep structure)
- JWT authentication & team management
- Anonymous evaluation & conflict detection
- Real-time WebSocket collaboration
- DECIDE methodology workflow

### Modify for Customer Response
- Database: Healthcare context → Customer response context
- API: Clinical endpoints → Customer response endpoints  
- Frontend: Medical terminology → Customer response terminology
- AI: DeepSeek integration for free/low-cost intelligence

## Week 1-2 Implementation Priority

### Database Schema Updates
```sql
-- Extend existing decisions table
ALTER TABLE decisions ADD COLUMN customer_context JSONB;
ALTER TABLE decisions ADD COLUMN response_urgency INTEGER CHECK (response_urgency >= 1 AND response_urgency <= 5);
ALTER TABLE decisions ADD COLUMN customer_tier VARCHAR(20);
```

### API Endpoint Modifications
- Keep: Core decision CRUD, team management, evaluation
- Modify: Request/response schemas for customer context
- Add: Customer response classification endpoints

### Frontend Changes
- Rebrand: Healthcare → Customer response interface
- Update: Team roles (clinical → support/sales/success)
- Add: Customer context inputs, response drafts

## DeepSeek AI Integration
- Text classification for customer issues
- Stakeholder recommendations based on issue type
- Response draft generation from team input
- Free API usage to minimize costs

## Next Steps
1. Database schema modifications (Day 1-2)
2. API endpoint updates (Day 3-4)
3. Frontend rebranding (Day 5-7)
4. DeepSeek integration (Week 2)