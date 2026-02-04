-- =============================================================================
-- Enable Row Level Security (RLS) Policies
-- Run this SQL in the Supabase SQL Editor
-- =============================================================================
-- Fixes the following Supabase Security Advisor warnings:
--   1. RLS Disabled on: admin_users, hubspot_field_mappings, verified_configurations
--   2. RLS Policy Always True on: configurations (overly permissive service_role policy)
--
-- Notes:
--   - The service_role client bypasses RLS automatically, so no service_role policies needed
--   - "authenticated" = logged-in Supabase Auth users (admin access enforced in app code)
--   - "anon" = unauthenticated / public requests
-- =============================================================================

-- =============================================================================
-- 1. admin_users
-- =============================================================================
-- Used by: middleware, auth callback, admin user management (all via auth client)
-- Access: Only authenticated users (app-level code enforces super_admin for CRUD)

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert admin_users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update admin_users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete admin_users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- 2. hubspot_field_mappings
-- =============================================================================
-- Used by: admin dashboard stats, mapping management (auth client)
--          mapping-service.ts cached reads (service_role client — bypasses RLS)
-- Access: Only authenticated users via auth client

ALTER TABLE hubspot_field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read hubspot_field_mappings"
  ON hubspot_field_mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert hubspot_field_mappings"
  ON hubspot_field_mappings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update hubspot_field_mappings"
  ON hubspot_field_mappings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete hubspot_field_mappings"
  ON hubspot_field_mappings FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- 3. verified_configurations
-- =============================================================================
-- Used by: public /api/verified-configs endpoint (auth client, no session = anon role)
--          admin CRUD (auth client, authenticated)
-- Access: anon can read active configs only; authenticated gets full CRUD

ALTER TABLE verified_configurations ENABLE ROW LEVEL SECURITY;

-- Public read access (anon) — restricted to active configs only
CREATE POLICY "Anyone can read active verified configurations"
  ON verified_configurations FOR SELECT
  TO anon
  USING (is_active = true);

-- Authenticated users can read all (including inactive, for admin management)
CREATE POLICY "Authenticated users can read all verified configurations"
  ON verified_configurations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert verified configurations"
  ON verified_configurations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update verified configurations"
  ON verified_configurations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete verified configurations"
  ON verified_configurations FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- 4. configurations (fix overly permissive policy)
-- =============================================================================
-- Used by: admin dashboard stats + recent submissions (auth client, authenticated)
--          public config creation/update (service_role client — bypasses RLS)
-- Access: Only authenticated users need access via auth client

-- Remove the overly permissive existing policy
DROP POLICY IF EXISTS "Service role has full access" ON configurations;

-- Admin dashboard reads via auth client
CREATE POLICY "Authenticated users can read configurations"
  ON configurations FOR SELECT
  TO authenticated
  USING (true);
