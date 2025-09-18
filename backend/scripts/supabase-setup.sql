-- Supabase Setup for Choseby Healthcare Platform
-- Run this in Supabase SQL Editor

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Row Level Security setup for multi-tenant teams
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Enable RLS on all tables (Supabase recommendation)
ALTER TABLE IF EXISTS teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluation_scores ENABLE ROW LEVEL SECURITY;

-- Create Supabase-compatible auth integration
-- (Supabase has built-in auth, but we're using custom for healthcare SSO)

-- Grant permissions for service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create indexes for Supabase performance
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at);
CREATE INDEX IF NOT EXISTS idx_evaluations_submitted_at ON evaluations(submitted_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp_user ON audit_log(timestamp, user_id);

-- Supabase real-time setup for team collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE websocket_connections;

-- Healthcare compliance: Audit trigger for all table changes
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        timestamp,
        success
    ) VALUES (
        COALESCE(auth.uid(), NULL),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old', CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
            'new', CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
        ),
        NOW(),
        true
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to healthcare-sensitive tables
DROP TRIGGER IF EXISTS audit_teams ON teams;
CREATE TRIGGER audit_teams AFTER INSERT OR UPDATE OR DELETE ON teams
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

DROP TRIGGER IF EXISTS audit_decisions ON decisions;
CREATE TRIGGER audit_decisions AFTER INSERT OR UPDATE OR DELETE ON decisions
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

DROP TRIGGER IF EXISTS audit_evaluations ON evaluations;
CREATE TRIGGER audit_evaluations AFTER INSERT OR UPDATE OR DELETE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- Supabase Edge Function compatibility
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Healthcare data retention policy (7 years HIPAA requirement)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_log
    WHERE timestamp < NOW() - INTERVAL '7 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run monthly)
-- Note: In production, set up pg_cron or external scheduler