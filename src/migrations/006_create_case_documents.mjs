export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS case_documents (
      id SERIAL PRIMARY KEY,
      case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      case_type VARCHAR(100),
      file_url TEXT NOT NULL,
      file_name VARCHAR(500) NOT NULL,
      mime_type VARCHAR(100),
      size_bytes INTEGER,
      description TEXT,
      text_content TEXT,
      extracted_data JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX idx_case_documents_case_id ON case_documents(case_id);
    CREATE INDEX idx_case_documents_case_type ON case_documents(case_type);
    CREATE INDEX idx_case_documents_created_at ON case_documents(created_at DESC);
  `);
  
  console.log('✅ Created case_documents table with indexes');
}

export async function down(db) {
  await db.query(`
    DROP TABLE IF EXISTS case_documents CASCADE;
  `);
  
  console.log('✅ Dropped case_documents table');
}
