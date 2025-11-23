-- Database initialization script
-- This script is run when the PostgreSQL container is first created

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE poker_planning'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'poker_planning')\gexec

-- Connect to the database
\c poker_planning;

-- Run the schema
\i /docker-entrypoint-initdb.d/schema.sql

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE poker_planning TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

