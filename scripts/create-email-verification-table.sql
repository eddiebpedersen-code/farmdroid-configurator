-- Email Verification Codes Table
-- Run this SQL in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose VARCHAR(20) NOT NULL DEFAULT 'email_lookup',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_purpose CHECK (purpose IN ('email_lookup', 'my_configs'))
);

-- Index for lookups (email + code combination)
CREATE INDEX IF NOT EXISTS idx_verification_email_code ON email_verification_codes(email, code);

-- Index for cleaning up expired codes
CREATE INDEX IF NOT EXISTS idx_verification_expires ON email_verification_codes(expires_at);

-- Index for rate limiting by IP
CREATE INDEX IF NOT EXISTS idx_verification_ip_created ON email_verification_codes(ip_hash, created_at);

-- Index for rate limiting by email
CREATE INDEX IF NOT EXISTS idx_verification_email_created ON email_verification_codes(email, created_at);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for API routes)
CREATE POLICY "Service role has full access" ON email_verification_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: Function to clean up expired codes (run as a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-verification-codes', '0 * * * *', 'SELECT cleanup_expired_verification_codes()');
