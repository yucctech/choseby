import { Pool } from 'pg';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Healthcare-compliant database query wrapper with audit logging
export class Database {
  static async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;

      // Log query for HIPAA audit trail
      console.log(`Query executed: ${text.substring(0, 100)}... Duration: ${duration}ms`);

      return result;
    } catch (error) {
      // Log database errors for healthcare compliance
      console.error('Database query error:', error);
      throw error;
    }
  }

  static async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Healthcare-specific query for audit trails
  static async auditLog(userId: string, action: string, resourceId?: string, details?: any) {
    const query = `
      INSERT INTO audit_log (user_id, action, resource_id, details, ip_address, timestamp)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    await this.query(query, [userId, action, resourceId, JSON.stringify(details), '127.0.0.1']);
  }

  // Conflict detection query for anonymous evaluations
  static async detectConflicts(decisionId: string) {
    const query = `
      SELECT
        es.option_id,
        es.criterion_id,
        do.name as option_name,
        dc.name as criterion_name,
        COUNT(*) as evaluation_count,
        AVG(es.score) as mean_score,
        STDDEV(es.score) as score_variance,
        CASE
          WHEN STDDEV(es.score) > 2.5 THEN 'high'
          WHEN STDDEV(es.score) > 1.5 THEN 'medium'
          WHEN STDDEV(es.score) > 0.5 THEN 'low'
          ELSE 'none'
        END as conflict_level
      FROM evaluation_scores es
      JOIN decision_options do ON es.option_id = do.id
      JOIN decision_criteria dc ON es.criterion_id = dc.id
      JOIN evaluations e ON es.evaluation_id = e.id
      WHERE e.decision_id = $1
      GROUP BY es.option_id, es.criterion_id, do.name, dc.name
      HAVING COUNT(*) >= 2 AND STDDEV(es.score) > 0.5
    `;
    return await this.query(query, [decisionId]);
  }
}

export default Database;