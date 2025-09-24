# Security Implementation

## Authentication & Authorization

### Password Security
- **Bcrypt hashing** with cost factor 12
- Passwords never logged or exposed in responses
- Minimum password requirements enforced in production

### JWT Tokens
- **HS256 signing** with 256-bit secret
- 1-hour access token expiration
- 7-day refresh token rotation
- Tokens validated on every protected route

### HTTPS Enforcement
- Automatic HTTPS redirect in production
- HSTS headers with 1-year max-age
- TLS 1.2+ required for all connections

## API Security

### Rate Limiting
- **Token bucket algorithm** per IP address
- Default: 1000 requests per hour
- 429 status returned when exceeded
- Configurable via API_RATE_LIMIT environment variable

### SQL Injection Protection
- **100% parameterized queries** throughout codebase
- No string concatenation in SQL statements
- Validated with grep audit: all queries use $1, $2 placeholders

### CORS Configuration
- Whitelist-based origin validation
- No wildcard (*) origins in production
- Credentials support for same-origin requests
- Configurable via CORS_ORIGINS environment variable

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Environment Variables

### Required for Production
```bash
# Generate secure JWT secret (minimum 32 chars)
openssl rand -hex 32

# Set in environment
export JWT_SECRET="<generated-secret>"
export DATABASE_URL="postgresql://..."
```

### Secret Management
- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets quarterly
- Store production secrets in secure vault (Render/Vercel environment variables)

## WebSocket Security
- Token-based authentication required
- Connection limits enforced (default: 1000)
- Heartbeat monitoring every 30 seconds
- Automatic cleanup of stale connections

## Audit Logging
- All authentication attempts logged
- Failed login tracking for security monitoring
- 7-year retention for compliance
- IP address and user agent captured

## Database Security
- Connection pooling with max 20 connections
- SSL/TLS required for all connections
- Prepared statements prevent SQL injection
- Role-based access control (RBAC)

## Production Checklist

### Before Deployment
- [ ] Generate and set strong JWT_SECRET (min 32 chars)
- [ ] Configure DATABASE_URL with SSL enabled
- [ ] Set ENVIRONMENT=production
- [ ] Configure CORS_ORIGINS to production domains only
- [ ] Enable GIN_MODE=release
- [ ] Review and rotate all API keys/secrets
- [ ] Verify HTTPS is enforced
- [ ] Test rate limiting configuration
- [ ] Review audit log retention settings

### Monitoring
- Monitor failed authentication attempts
- Track rate limit violations
- Review audit logs regularly
- Set up alerts for security events

## Vulnerability Response
- Security issues: Contact team immediately
- Follow responsible disclosure
- Apply security patches within 24 hours
- Document all security incidents

## Compliance
- Industry-agnostic platform (no healthcare-specific data handling)
- Standard authentication best practices
- Configurable audit retention (default 7 years)
- Data export encryption available

## Dependencies
- Regular security updates via `go get -u`
- Automated dependency scanning recommended
- Known vulnerability monitoring
