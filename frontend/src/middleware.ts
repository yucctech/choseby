import { NextRequest, NextResponse } from 'next/server';
import { HIPAACompliance } from './lib/hipaa';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const url = new URL(request.url);

  // Skip middleware for static files and health checks
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/health') ||
    url.pathname.includes('favicon') ||
    url.pathname.includes('.') // Skip static files
  ) {
    return NextResponse.next();
  }

  // Extract request information for HIPAA audit
  const requestInfo = {
    method: request.method,
    pathname: url.pathname,
    searchParams: url.searchParams.toString(),
    ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
  };

  // Create response
  const response = NextResponse.next();

  // Add security headers for HIPAA compliance
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HIPAA-specific security headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');

  // Content Security Policy for healthcare applications
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval in dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' wss: ws:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Rate limiting for healthcare APIs
  if (url.pathname.startsWith('/api/')) {
    const rateLimitKey = `rate-limit:${requestInfo.ipAddress}:${url.pathname}`;
    // In production, implement actual rate limiting with Redis
    // For now, just add the header for monitoring
    response.headers.set('X-RateLimit-Limit', '1000');
    response.headers.set('X-RateLimit-Remaining', '999');
  }

  // Log API access for HIPAA audit trail
  if (url.pathname.startsWith('/api/') && request.method !== 'OPTIONS') {
    const endTime = Date.now();
    const duration = endTime - start;

    // Extract user ID from Authorization header if present
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        // In production, verify JWT and extract user ID
        // For now, we'll handle this in the API routes
        userId = 'system'; // Placeholder
      } catch (error) {
        // Invalid token - will be handled in API routes
      }
    }

    // Determine resource type and action from URL
    const pathSegments = url.pathname.split('/').filter(Boolean);
    let resourceType = 'api';
    let action = request.method.toLowerCase();

    if (pathSegments.length >= 2) {
      resourceType = pathSegments[1]; // e.g., 'teams', 'decisions', 'evaluations'
    }

    if (pathSegments.includes('evaluations')) {
      action = 'evaluation_' + action;
    } else if (pathSegments.includes('conflicts')) {
      action = 'conflict_' + action;
    }

    // Don't await - fire and forget for performance
    HIPAACompliance.auditEvent({
      userId,
      action: `api_${action}`,
      resourceType: `api_${resourceType}`,
      resourceId: pathSegments[2], // Often the ID parameter
      details: {
        method: request.method,
        pathname: url.pathname,
        duration,
        status_code: response.status,
        query_params: Object.fromEntries(url.searchParams)
      },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      success: response.status < 400
    }).catch(error => {
      console.error('HIPAA audit logging failed:', error);
    });
  }

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  // Add processing time header
  const processingTime = Date.now() - start;
  response.headers.set('X-Processing-Time', processingTime.toString());

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};