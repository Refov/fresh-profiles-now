-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily cleanup of expired profiles at 2 AM UTC
SELECT cron.schedule(
  'cleanup-expired-profiles',
  '0 2 * * *', -- At 2:00 AM every day
  $$
  SELECT net.http_post(
    url := 'https://zgsauogyiejsssngyhcq.supabase.co/functions/v1/cleanup-expired',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnc2F1b2d5aWVqc3Nzbmd5aGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODAwOTEsImV4cCI6MjA3NjI1NjA5MX0.833ILDd2cywXOT-UsdPRC7jUqa5aMIVhMdvZd2daQOY"}'::jsonb,
    body := '{"time": "' || now() || '"}'::jsonb
  ) as request_id;
  $$
);