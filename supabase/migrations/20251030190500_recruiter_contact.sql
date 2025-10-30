-- Tables to support recruiter email verification and contact messaging

CREATE TABLE IF NOT EXISTS recruiter_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address TEXT,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_recruiter_verifications_email ON recruiter_verifications (recruiter_email);
CREATE INDEX IF NOT EXISTS idx_recruiter_verifications_profile ON recruiter_verifications (profile_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_verifications_created ON recruiter_verifications (created_at);

ALTER TABLE recruiter_verifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS recruiter_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender_ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_recruiter_messages_profile ON recruiter_messages (profile_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_messages_email ON recruiter_messages (recruiter_email);

ALTER TABLE recruiter_messages ENABLE ROW LEVEL SECURITY;


