-- Migration: Add request_captures table for full request/response inspection
-- Run this on existing databases to add the new table without losing data

-- ============================================================================
-- Request captures (full request/response data for inspection)
-- ============================================================================
CREATE TABLE IF NOT EXISTS request_captures (
    id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tunnel_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    retention_days SMALLINT DEFAULT 3,
    
    -- Request data
    request_headers JSONB,
    request_body TEXT,
    request_body_size INTEGER DEFAULT 0,
    
    -- Response data  
    response_headers JSONB,
    response_body TEXT,
    response_body_size INTEGER DEFAULT 0,
    
    PRIMARY KEY (id, timestamp)
)
WITH (
    tsdb.hypertable,
    tsdb.chunk_interval = '1 day'
);

-- Create indexes for lookups (IF NOT EXISTS not supported, so we use DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_request_captures_tunnel_id') THEN
        CREATE INDEX idx_request_captures_tunnel_id ON request_captures (tunnel_id, timestamp DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_request_captures_organization_id') THEN
        CREATE INDEX idx_request_captures_organization_id ON request_captures (organization_id, timestamp DESC);
    END IF;
END $$;

-- Retention policy
SELECT add_retention_policy('request_captures', INTERVAL '90 days', if_not_exists => TRUE);

-- Function to clean up expired request captures
CREATE OR REPLACE FUNCTION cleanup_expired_request_captures()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM request_captures
    WHERE timestamp < NOW() - (retention_days * INTERVAL '1 day');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % expired rows from request_captures', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Update the combined cleanup function to include request captures
CREATE OR REPLACE FUNCTION cleanup_expired_events(job_id INTEGER, config JSONB)
RETURNS VOID AS $$
BEGIN
    PERFORM cleanup_expired_tunnel_events();
    PERFORM cleanup_expired_protocol_events();
    PERFORM cleanup_expired_request_captures();
END;
$$ LANGUAGE plpgsql;
