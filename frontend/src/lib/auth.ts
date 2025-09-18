import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import Database from './database';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'physician' | 'nurse' | 'administrator' | 'technician' | 'pharmacist' | 'other';
  department?: string;
  license_number?: string;
  teams: string[];
  permissions: string[];
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  teams: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export class AuthService {
  // Generate JWT token for authenticated user
  static generateToken(user: AuthUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      teams: user.teams,
      permissions: user.permissions,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRATION || '3600s',
    });
  }

  // Generate refresh token
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Hash password for storage
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Higher for healthcare security
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Authenticate user with email and password
  static async authenticate(email: string, password: string): Promise<AuthUser | null> {
    try {
      // Get user with password hash
      const userResult = await Database.query(
        'SELECT id, email, name, role, department, license_number, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return null;
      }

      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return null;
      }

      // Get user teams and permissions
      const teamsResult = await Database.query(
        `SELECT tm.team_id, tm.role, tm.permissions
         FROM team_members tm
         WHERE tm.user_id = $1`,
        [user.id]
      );

      const teams = teamsResult.rows.map(row => row.team_id);
      const permissions = teamsResult.rows.reduce((acc, row) => {
        return [...acc, ...row.permissions];
      }, []);

      // Update last login
      await Database.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Log authentication for HIPAA audit
      await Database.auditLog(user.id, 'user_login', user.id);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        license_number: user.license_number,
        teams,
        permissions: [...new Set(permissions)], // Remove duplicates
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Create new user session
  static async createSession(user: AuthUser, ssoProvider?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    // Store session in database
    await Database.query(
      `INSERT INTO user_sessions (user_id, session_token, refresh_token, sso_provider, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '${process.env.JWT_EXPIRATION || '3600'} seconds')`,
      [user.id, accessToken, refreshToken, ssoProvider || null]
    );

    return { accessToken, refreshToken };
  }

  // Validate session and get user
  static async validateSession(token: string): Promise<AuthUser | null> {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    // Check if session exists in database
    const sessionResult = await Database.query(
      'SELECT * FROM user_sessions WHERE session_token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return null;
    }

    // Update last accessed
    await Database.query(
      'UPDATE user_sessions SET last_accessed = NOW() WHERE session_token = $1',
      [token]
    );

    // Get current user data
    const userResult = await Database.query(
      'SELECT id, email, name, role, department, license_number FROM users WHERE id = $1',
      [payload.sub]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Get updated teams and permissions
    const teamsResult = await Database.query(
      `SELECT tm.team_id, tm.role, tm.permissions
       FROM team_members tm
       WHERE tm.user_id = $1`,
      [user.id]
    );

    const teams = teamsResult.rows.map(row => row.team_id);
    const permissions = teamsResult.rows.reduce((acc, row) => {
      return [...acc, ...row.permissions];
    }, []);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      license_number: user.license_number,
      teams,
      permissions: [...new Set(permissions)],
    };
  }

  // Check if user has specific permission
  static hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  // Check if user is team member
  static isTeamMember(user: AuthUser, teamId: string): boolean {
    return user.teams.includes(teamId);
  }

  // Check if user is team facilitator
  static async isTeamFacilitator(userId: string, teamId: string): Promise<boolean> {
    const result = await Database.query(
      'SELECT role FROM team_members WHERE user_id = $1 AND team_id = $2',
      [userId, teamId]
    );

    return result.rows.length > 0 &&
           (result.rows[0].role === 'facilitator' || result.rows[0].role === 'administrator');
  }

  // Logout user (invalidate session)
  static async logout(token: string): Promise<void> {
    const payload = this.verifyToken(token);
    if (payload) {
      await Database.query(
        'DELETE FROM user_sessions WHERE session_token = $1',
        [token]
      );

      // Log logout for HIPAA audit
      await Database.auditLog(payload.sub, 'user_logout', payload.sub);
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<string | null> {
    const payload = this.verifyToken(refreshToken);
    if (!payload) {
      return null;
    }

    // Check if refresh token exists
    const sessionResult = await Database.query(
      'SELECT user_id FROM user_sessions WHERE refresh_token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      return null;
    }

    // Get current user for new token
    const user = await this.validateSession(refreshToken);
    if (!user) {
      return null;
    }

    // Generate new access token
    const newAccessToken = this.generateToken(user);

    // Update session with new token
    await Database.query(
      'UPDATE user_sessions SET session_token = $1, last_accessed = NOW() WHERE refresh_token = $2',
      [newAccessToken, refreshToken]
    );

    return newAccessToken;
  }
}

// Middleware to protect routes
export function withAuth(handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      const user = await AuthService.validateSession(token);

      if (!user) {
        return NextResponse.json({ error: 'unauthorized', message: 'Invalid or expired token' }, { status: 401 });
      }

      return await handler(req, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'internal_error', message: 'Authentication failed' }, { status: 500 });
    }
  };
}

// Middleware to check team membership
export function withTeamAccess(handler: (req: NextRequest, user: AuthUser, teamId: string) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest, user: AuthUser): Promise<NextResponse> => {
    const url = new URL(req.url);
    const teamId = url.pathname.split('/')[3]; // Assumes /api/teams/{teamId}/...

    if (!teamId) {
      return NextResponse.json({ error: 'bad_request', message: 'Team ID required' }, { status: 400 });
    }

    if (!AuthService.isTeamMember(user, teamId)) {
      return NextResponse.json({ error: 'forbidden', message: 'Team access required' }, { status: 403 });
    }

    return await handler(req, user, teamId);
  });
}

// Middleware to check specific permissions
export function withPermission(permission: string) {
  return (handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) => {
    return withAuth(async (req: NextRequest, user: AuthUser): Promise<NextResponse> => {
      if (!AuthService.hasPermission(user, permission)) {
        return NextResponse.json({
          error: 'forbidden',
          message: `Permission '${permission}' required`
        }, { status: 403 });
      }

      return await handler(req, user);
    });
  };
}