-- 0001_extensions.sql
-- Phase 1. Extensions only. pg_trgm backs the marketplace free-text search
-- (spec §5.2 `q`); trigram was chosen over tsvector so that punctuation in a
-- search term can never raise a syntax error (spec §16, "special characters
-- do not break the query").

create extension if not exists pg_trgm with schema extensions;
