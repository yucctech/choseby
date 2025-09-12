# ADR-001: Pricing Strategy - Team vs Individual Models

## Status
**Under Consideration** - Team pricing prioritized for MVP, individual pricing post-MVP

## Context
Customer validation revealed demand for both team-based and individual decision-making tools:
- **Team Model**: 15/15 interviews validated team decision facilitation ($107.50-172/month)
- **Individual Model**: 1/1 interview validated individual decision frameworks ($21.50/user/month)

## Decision
**MVP Strategy**: Implement team-based pricing first, consider individual pricing after MVP validation

### Team-Based Pricing (Immediate Implementation)
- **5-person team**: $107.50/month
- **6-person team**: $129/month  
- **7-person team**: $150.50/month
- **8-person team**: $172/month

**Rationale**: 
- 15/15 customer validation vs 1/1 for individual
- Higher revenue per customer ($107-172 vs $21.50)
- Stronger customer budgets (150-400% above our pricing)
- First-mover advantage in team decision facilitation

### Individual Pricing (Post-MVP Consideration)
- **Per-user**: $21.50/user/month
- **Use case**: Solo decision-makers, smaller teams, market expansion
- **Validation**: Healthcare operations manager valued framework at $500+

## Consequences

### Positive
- ✅ Focus development resources on highest-validated model (15/15 interviews)
- ✅ Higher revenue per customer enables faster growth
- ✅ Team features create stronger customer lock-in than individual tools
- ✅ Individual model provides post-MVP expansion opportunity

### Negative  
- ❌ May miss individual customer segment during MVP phase
- ❌ Complex pricing strategy requires clear communication
- ❌ Individual features development delayed until post-MVP

### Risks & Mitigation
- **Risk**: Individual customers switch to competitors during MVP development
- **Mitigation**: Strong validation shows unoccupied market category
- **Risk**: Technical complexity supporting both pricing models
- **Mitigation**: Individual features can build on team platform foundation

## Implementation Plan
1. **Phase 1 MVP**: Team features only, team-based pricing
2. **Phase 2 Expansion**: Add individual features and pricing option
3. **Hybrid Option**: Teams can invite individual consultants/advisors at individual rates

## Success Criteria
- **MVP Success**: 5+ paying teams at $107-172/month, $500+ MRR
- **Individual Validation**: Post-MVP testing with individual pricing
- **Market Expansion**: Both pricing models serving different customer needs

## Related Decisions
- Technical architecture supports both team and individual workflows
- Customer research continues for both segments
- Marketing positioning emphasizes team collaboration first

**Owner**: Solo Founder  
**Date**: Current (September 2025)  
**Review**: After MVP validation (Week 8)