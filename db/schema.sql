-- PostgreSQL Schema for Poker Planning Application
-- Migration from Convex to PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table (without owner foreign key initially due to circular dependency)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    voting_categorized BOOLEAN DEFAULT false,
    auto_complete_voting BOOLEAN DEFAULT false,
    room_type VARCHAR(50) DEFAULT 'canvas',
    voting_system VARCHAR(50) DEFAULT 'fibonacci',
    is_game_over BOOLEAN DEFAULT false,
    created_at BIGINT NOT NULL,
    last_activity_at BIGINT NOT NULL,
    owner_id UUID,
    password VARCHAR(255), -- bcrypt hashed password
    active_story_node_id VARCHAR(255)
);

-- Create indexes for rooms
CREATE INDEX idx_rooms_last_activity ON rooms(last_activity_at);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);
CREATE INDEX idx_rooms_owner_id ON rooms(owner_id);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_spectator BOOLEAN DEFAULT false,
    joined_at BIGINT NOT NULL,
    last_reaction_type VARCHAR(50),
    last_reaction_at BIGINT,
    CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create indexes for users
CREATE INDEX idx_users_room_id ON users(room_id);
CREATE INDEX idx_users_room_joined ON users(room_id, joined_at);

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    user_id UUID NOT NULL,
    card_label VARCHAR(50),
    card_value NUMERIC,
    card_icon VARCHAR(50),
    CONSTRAINT fk_vote_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_vote_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)
);

-- Create indexes for votes
CREATE INDEX idx_votes_room_id ON votes(room_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_room_user ON votes(room_id, user_id);

-- Canvas nodes table
CREATE TABLE canvas_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    position JSONB NOT NULL,
    data JSONB,
    is_locked BOOLEAN DEFAULT false,
    last_updated_by UUID,
    last_updated_at BIGINT NOT NULL,
    CONSTRAINT fk_canvas_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_canvas_user FOREIGN KEY (last_updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(room_id, node_id)
);

-- Create indexes for canvas nodes
CREATE INDEX idx_canvas_nodes_room_id ON canvas_nodes(room_id);
CREATE INDEX idx_canvas_nodes_room_node ON canvas_nodes(room_id, node_id);
CREATE INDEX idx_canvas_nodes_room_type ON canvas_nodes(room_id, type);
CREATE INDEX idx_canvas_nodes_last_updated ON canvas_nodes(last_updated_at);

-- Canvas state table
CREATE TABLE canvas_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    user_id UUID NOT NULL,
    viewport JSONB NOT NULL,
    last_updated_at BIGINT NOT NULL,
    CONSTRAINT fk_canvas_state_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_canvas_state_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)
);

-- Create indexes for canvas state
CREATE INDEX idx_canvas_state_room_id ON canvas_state(room_id);
CREATE INDEX idx_canvas_state_room_user ON canvas_state(room_id, user_id);

-- Presence table
CREATE TABLE presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    user_id UUID NOT NULL,
    cursor JSONB,
    is_active BOOLEAN DEFAULT true,
    last_ping BIGINT NOT NULL,
    CONSTRAINT fk_presence_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_presence_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)
);

-- Create indexes for presence
CREATE INDEX idx_presence_room_id ON presence(room_id);
CREATE INDEX idx_presence_room_user ON presence(room_id, user_id);
CREATE INDEX idx_presence_last_ping ON presence(last_ping);

-- Activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL,
    CONSTRAINT fk_activity_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create indexes for activities
CREATE INDEX idx_activities_room_id ON activities(room_id);
CREATE INDEX idx_activities_room_created ON activities(room_id, created_at);

-- Integrations table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    config JSONB,
    connected_at BIGINT NOT NULL,
    CONSTRAINT fk_integration_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create indexes for integrations
CREATE INDEX idx_integrations_room_id ON integrations(room_id);

-- Add foreign key constraint from rooms to users (after both tables exist)
ALTER TABLE rooms 
ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- Function to clean up old inactive rooms (called by cron job)
CREATE OR REPLACE FUNCTION cleanup_inactive_rooms(days_threshold INTEGER DEFAULT 8)
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    threshold_timestamp BIGINT;
    result BIGINT;
BEGIN
    -- Calculate threshold timestamp (current time - days in milliseconds)
    threshold_timestamp := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT - (days_threshold * 24 * 60 * 60 * 1000)::BIGINT;
    
    -- Delete rooms older than threshold
    WITH deleted AS (
        DELETE FROM rooms
        WHERE last_activity_at < threshold_timestamp
        RETURNING id
    )
    SELECT COUNT(*) INTO result FROM deleted;
    
    RETURN QUERY SELECT result;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up stale presence records
CREATE OR REPLACE FUNCTION cleanup_stale_presence(minutes_threshold INTEGER DEFAULT 5)
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    threshold_timestamp BIGINT;
    result BIGINT;
BEGIN
    -- Calculate threshold timestamp (current time - minutes in milliseconds)
    threshold_timestamp := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT - (minutes_threshold * 60 * 1000)::BIGINT;
    
    -- Delete presence records older than threshold
    WITH deleted AS (
        DELETE FROM presence
        WHERE last_ping < threshold_timestamp
        RETURNING id
    )
    SELECT COUNT(*) INTO result FROM deleted;
    
    RETURN QUERY SELECT result;
END;
$$ LANGUAGE plpgsql;

