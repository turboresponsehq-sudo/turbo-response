CREATE TABLE IF NOT EXISTS brain_documents (
    id              BIGSERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT NULL,
    file_url        TEXT NOT NULL,
    mime_type       TEXT NULL,
    size_bytes      BIGINT NULL,
    source          TEXT DEFAULT 'upload',
    
    relevance_score INTEGER,
    is_outdated     BOOLEAN DEFAULT FALSE,
    is_duplicate    BOOLEAN DEFAULT FALSE,
    is_archived     BOOLEAN DEFAULT FALSE,

    usage_count     INTEGER DEFAULT 0,
    last_used_at    TIMESTAMPTZ NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brain_documents_created_at
    ON brain_documents (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brain_documents_relevance
    ON brain_documents (relevance_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_brain_documents_is_archived
    ON brain_documents (is_archived);
