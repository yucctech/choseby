-- Seed Demo User for Testing
-- Run this script to create demo@choseby.com user with password: demo123

BEGIN;

-- Create demo team
INSERT INTO teams (id, name, company_name, team_size, subscription_tier, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Team',
    'Demo Company',
    1,
    'starter',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create demo user
-- Password: demo123
-- BCrypt hash generated with cost 10
INSERT INTO team_members (
    id,
    team_id,
    email,
    name,
    password_hash,
    role,
    escalation_authority,
    notification_preferences,
    is_active,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'demo@choseby.com',
    'Demo User',
    '$2a$10$YourBcryptHashHere', -- Will be replaced with actual hash
    'customer_success_manager',
    5,
    '{"email": true, "sms": false, "push": true}'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

COMMIT;

-- Note: The password hash needs to be generated using bcrypt with cost 10
-- Use the Go backend to generate: bcrypt.GenerateFromPassword([]byte("demo123"), bcrypt.DefaultCost)
