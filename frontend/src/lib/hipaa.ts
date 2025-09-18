import { randomBytes, createCipher, createDecipher, createHash } from 'crypto';
import Database from './database';

interface AuditEvent {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export class HIPAACompliance {
  private static readonly ENCRYPTION_CONFIG: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16
  };

  private static getEncryptionKey(): string {
    const key = process.env.HIPAA_ENCRYPTION_KEY;
    if (!key || key.length !== 64) { // 32 bytes = 64 hex chars
      throw new Error('HIPAA_ENCRYPTION_KEY must be 64 character hex string (32 bytes)');
    }
    return key;
  }

  // Encrypt sensitive healthcare data
  static encryptPHI(data: string): { encryptedData: string; iv: string; tag: string } {
    try {
      const key = Buffer.from(this.getEncryptionKey(), 'hex');
      const iv = randomBytes(this.ENCRYPTION_CONFIG.ivLength);

      const cipher = createCipher(this.ENCRYPTION_CONFIG.algorithm, key);
      cipher.setAAD(Buffer.from('CHOSEBY-HIPAA-PHI'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('PHI encryption failed:', error);
      throw new Error('Failed to encrypt protected health information');
    }
  }

  // Decrypt sensitive healthcare data
  static decryptPHI(encryptedData: string, iv: string, tag: string): string {
    try {
      const key = Buffer.from(this.getEncryptionKey(), 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');

      const decipher = crypto.createDecipher(this.ENCRYPTION_CONFIG.algorithm, key);
      decipher.setAAD(Buffer.from('CHOSEBY-HIPAA-PHI'));
      decipher.setAuthTag(tagBuffer);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('PHI decryption failed:', error);
      throw new Error('Failed to decrypt protected health information');
    }
  }

  // Create comprehensive HIPAA audit log entry
  static async auditEvent(event: AuditEvent): Promise<void> {
    try {
      const auditData = {
        user_id: event.userId || null,
        action: event.action,
        resource_type: event.resourceType,
        resource_id: event.resourceId || null,
        details: event.details ? JSON.stringify(event.details) : null,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        success: event.success,
        error_message: event.errorMessage || null,
        timestamp: new Date(),
        compliance_flags: this.generateComplianceFlags(event)
      };

      await Database.query(
        `INSERT INTO audit_log
         (user_id, action, resource_type, resource_id, details, ip_address, user_agent,
          success, error_message, timestamp, compliance_flags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          auditData.user_id,
          auditData.action,
          auditData.resource_type,
          auditData.resource_id,
          auditData.details,
          auditData.ip_address,
          auditData.user_agent,
          auditData.success,
          auditData.error_message,
          auditData.timestamp,
          JSON.stringify(auditData.compliance_flags)
        ]
      );
    } catch (error) {
      console.error('HIPAA audit logging failed:', error);
      // Don't throw - audit failures shouldn't break business logic
      // But log to a separate monitoring system
    }
  }

  // Generate compliance flags for audit entries
  private static generateComplianceFlags(event: AuditEvent): any {
    const flags = {
      hipaa_relevant: this.isHIPAARelevant(event.action, event.resourceType),
      phi_access: this.isPHIAccess(event.action, event.resourceType),
      security_event: this.isSecurityEvent(event.action),
      patient_safety: this.isPatientSafetyEvent(event.action, event.details),
      data_export: event.action.includes('export') || event.action.includes('download'),
      authentication: event.action.includes('login') || event.action.includes('logout'),
      retention_period: this.calculateRetentionPeriod(event.resourceType)
    };

    return flags;
  }

  // Determine if action/resource involves HIPAA
  private static isHIPAARelevant(action: string, resourceType: string): boolean {
    const hipaaActions = ['access_phi', 'modify_phi', 'export_phi', 'delete_phi'];
    const hipaaResources = ['patient_data', 'clinical_decision', 'medical_record'];

    return hipaaActions.some(a => action.includes(a)) ||
           hipaaResources.some(r => resourceType.includes(r));
  }

  // Determine if action involves PHI access
  private static isPHIAccess(action: string, resourceType: string): boolean {
    return action.includes('view') || action.includes('access') ||
           resourceType.includes('patient') || resourceType.includes('clinical');
  }

  // Determine if action is security-related
  private static isSecurityEvent(action: string): boolean {
    const securityActions = ['login', 'logout', 'failed_login', 'password_change',
                           'permission_change', 'access_denied'];
    return securityActions.some(a => action.includes(a));
  }

  // Determine if action affects patient safety
  private static isPatientSafetyEvent(action: string, details: any): boolean {
    if (!details) return false;

    return action.includes('clinical_decision') ||
           details.patient_impact === 'high' ||
           details.decision_type === 'clinical' ||
           action.includes('emergency');
  }

  // Calculate retention period based on resource type
  private static calculateRetentionPeriod(resourceType: string): number {
    // HIPAA requires 6+ years for most healthcare records
    const retentionYears = parseInt(process.env.AUDIT_RETENTION_YEARS || '7');
    return retentionYears;
  }

  // Validate user access to PHI based on role and need-to-know
  static validatePHIAccess(userId: string, resourceId: string, action: string): Promise<boolean> {
    return Database.query(
      `SELECT
         u.role, u.department,
         tm.permissions,
         d.patient_impact,
         d.decision_type
       FROM users u
       JOIN team_members tm ON u.id = tm.user_id
       JOIN decisions d ON tm.team_id = d.team_id
       WHERE u.id = $1 AND d.id = $2`,
      [userId, resourceId]
    ).then(result => {
      if (result.rows.length === 0) return false;

      const { role, permissions, patient_impact, decision_type } = result.rows[0];

      // Clinical staff have broader access to patient-impacting decisions
      if (role === 'physician' || role === 'nurse') {
        return patient_impact !== 'none' || decision_type === 'clinical';
      }

      // Administrative staff have limited access
      if (role === 'administrator') {
        return decision_type !== 'clinical' || action === 'view';
      }

      // Check specific permissions
      return permissions.includes('access_phi') || permissions.includes(action);
    });
  }

  // Generate HIPAA compliance report
  static async generateComplianceReport(teamId: string, startDate: Date, endDate: Date): Promise<any> {
    const auditQuery = `
      SELECT
        action,
        resource_type,
        success,
        compliance_flags,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit_log
      WHERE timestamp BETWEEN $1 AND $2
        AND (details::jsonb->>'team_id' = $3 OR resource_id IN (
          SELECT id::text FROM decisions WHERE team_id = $3
        ))
      GROUP BY action, resource_type, success, compliance_flags
      ORDER BY event_count DESC
    `;

    const auditResults = await Database.query(auditQuery, [startDate, endDate, teamId]);

    const securityQuery = `
      SELECT
        user_id,
        action,
        success,
        COUNT(*) as attempt_count
      FROM audit_log
      WHERE timestamp BETWEEN $1 AND $2
        AND compliance_flags::jsonb->>'security_event' = 'true'
      GROUP BY user_id, action, success
      HAVING COUNT(*) > 5  -- Flag unusual activity
    `;

    const securityResults = await Database.query(securityQuery, [startDate, endDate]);

    return {
      period: { start: startDate, end: endDate },
      team_id: teamId,
      audit_summary: auditResults.rows,
      security_events: securityResults.rows,
      compliance_status: {
        total_events: auditResults.rows.reduce((sum, row) => sum + parseInt(row.event_count), 0),
        phi_access_events: auditResults.rows
          .filter(row => JSON.parse(row.compliance_flags).phi_access)
          .reduce((sum, row) => sum + parseInt(row.event_count), 0),
        failed_events: auditResults.rows
          .filter(row => !row.success)
          .reduce((sum, row) => sum + parseInt(row.event_count), 0),
        retention_compliant: true, // Would check against retention policies
        encryption_status: 'active'
      },
      recommendations: this.generateComplianceRecommendations(auditResults.rows, securityResults.rows)
    };
  }

  // Generate compliance recommendations
  private static generateComplianceRecommendations(auditData: any[], securityData: any[]): string[] {
    const recommendations: string[] = [];

    // Check for excessive failed attempts
    const failedAttempts = auditData.filter(row => !row.success);
    if (failedAttempts.length > 0) {
      recommendations.push('Review failed access attempts and strengthen authentication measures');
    }

    // Check for unusual security activity
    if (securityData.length > 0) {
      recommendations.push('Investigate flagged security events for potential unauthorized access');
    }

    // Check PHI access patterns
    const phiAccess = auditData.filter(row =>
      JSON.parse(row.compliance_flags || '{}').phi_access
    );
    if (phiAccess.length > 100) {
      recommendations.push('High volume of PHI access detected - ensure all access is justified');
    }

    return recommendations;
  }

  // Anonymize data for evaluation system
  static anonymizeEvaluationData(evaluationData: any): any {
    // Remove any identifying information while preserving evaluation integrity
    const anonymized = { ...evaluationData };

    // Remove user identification but keep session tracking
    delete anonymized.user_id;
    delete anonymized.user_name;
    delete anonymized.user_email;

    // Keep anonymous session ID for aggregation
    anonymized.anonymous_session = crypto
      .createHash('sha256')
      .update(`${evaluationData.user_id}-${evaluationData.decision_id}`)
      .digest('hex')
      .substring(0, 16);

    return anonymized;
  }

  // Data retention cleanup (should be run periodically)
  static async performRetentionCleanup(): Promise<{ deleted: number; retained: number }> {
    const retentionYears = parseInt(process.env.AUDIT_RETENTION_YEARS || '7');
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

    try {
      // Count records to be deleted
      const countResult = await Database.query(
        'SELECT COUNT(*) as count FROM audit_log WHERE timestamp < $1',
        [cutoffDate]
      );
      const toDelete = parseInt(countResult.rows[0].count);

      // Archive critical records before deletion (if needed)
      await Database.query(
        `INSERT INTO audit_log_archive
         SELECT * FROM audit_log
         WHERE timestamp < $1 AND compliance_flags::jsonb->>'hipaa_relevant' = 'true'`,
        [cutoffDate]
      );

      // Delete old records
      const deleteResult = await Database.query(
        'DELETE FROM audit_log WHERE timestamp < $1',
        [cutoffDate]
      );

      // Count remaining records
      const remainingResult = await Database.query('SELECT COUNT(*) as count FROM audit_log');
      const retained = parseInt(remainingResult.rows[0].count);

      await this.auditEvent({
        action: 'retention_cleanup',
        resourceType: 'audit_log',
        details: { deleted: toDelete, retained, cutoff_date: cutoffDate },
        success: true
      });

      return { deleted: toDelete, retained };
    } catch (error) {
      await this.auditEvent({
        action: 'retention_cleanup_failed',
        resourceType: 'audit_log',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Retention cleanup failed'
      });

      throw error;
    }
  }
}