-- PostgreSQL RPC Function for Vector Similarity Search
-- This function provides efficient vector search using pgvector's built-in operators

CREATE OR REPLACE FUNCTION search_brain_chunks(
  query_embedding vector(1536),
  match_count integer DEFAULT 5,
  filter_document_ids integer[] DEFAULT NULL
)
RETURNS TABLE (
  id integer,
  document_id integer,
  content text,
  chunk_index integer,
  distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bc.id,
    bc.document_id,
    bc.content,
    bc.chunk_index,
    (bc.embedding <=> query_embedding) AS distance
  FROM brain_chunks bc
  WHERE
    CASE
      WHEN filter_document_ids IS NOT NULL THEN bc.document_id = ANY(filter_document_ids)
      ELSE TRUE
    END
  ORDER BY bc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_brain_chunks TO authenticated, anon;

-- Test the function (optional)
-- SELECT * FROM search_brain_chunks('[0.1, 0.2, ...]'::vector(1536), 5, NULL);
