-- =====================================================
-- Site Monitor Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT,
  scan_interval_minutes INT DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  last_scanned_at TIMESTAMPTZ,
  last_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_is_active ON sites(is_active);

-- RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sites" ON sites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sites" ON sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites" ON sites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites" ON sites
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  content_hash TEXT,
  status TEXT DEFAULT 'pending', -- pending, success, error
  error_message TEXT,
  raw_html_path TEXT, -- path in Supabase Storage
  fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_site_id ON pages(site_id);
CREATE INDEX IF NOT EXISTS idx_pages_content_hash ON pages(content_hash);

-- RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pages of own sites" ON pages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = pages.site_id AND sites.user_id = auth.uid())
  );

CREATE POLICY "System can insert pages" ON pages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = pages.site_id AND sites.user_id = auth.uid())
  );

-- =====================================================
-- CHUNKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  position INT NOT NULL,
  block_type TEXT, -- heading, paragraph, list, table, code
  content TEXT NOT NULL,
  token_count INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_page_version ON chunks(page_id, version);
CREATE INDEX IF NOT EXISTS idx_chunks_position ON chunks(page_id, position);

-- RLS
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chunks of own pages" ON chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pages 
      JOIN sites ON sites.id = pages.site_id 
      WHERE pages.id = chunks.page_id AND sites.user_id = auth.uid()
    )
  );

-- =====================================================
-- CHUNK_CHANGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chunk_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES chunks(id),
  change_type TEXT NOT NULL, -- added, removed, modified
  old_content TEXT,
  new_content TEXT,
  summary TEXT, -- LLM-generated summary
  detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunk_changes_page ON chunk_changes(page_id);
CREATE INDEX IF NOT EXISTS idx_chunk_changes_detected ON chunk_changes(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_chunk_changes_type ON chunk_changes(change_type);

-- RLS
ALTER TABLE chunk_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view changes of own pages" ON chunk_changes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pages 
      JOIN sites ON sites.id = pages.site_id 
      WHERE pages.id = chunk_changes.page_id AND sites.user_id = auth.uid()
    )
  );

-- =====================================================
-- KEYWORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_keywords_user_id ON keywords(user_id);

-- RLS
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own keywords" ON keywords
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATION_SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'daily', -- instant, daily, weekly
  email_address TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table for storing global web mentions found via AI search
CREATE TABLE IF NOT EXISTS global_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT,
  source TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE global_mentions ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can see their own global mentions" 
  ON global_mentions FOR SELECT 
  USING (auth.uid() = user_id);

-- Ensure global_mentions table exists for the feed
CREATE TABLE IF NOT EXISTS global_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT,
  source TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for it
ALTER TABLE global_mentions ENABLE ROW LEVEL SECURITY;

-- Policy for it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'global_mentions' AND policyname = 'Users can see their own global mentions'
    ) THEN
        CREATE POLICY "Users can see their own global mentions" 
          ON global_mentions FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
END $$;
