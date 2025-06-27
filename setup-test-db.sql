

CREATE EXTENSION IF NOT EXISTS postgis;

DO $$
BEGIN
IF NOT EXISTS(select 1 FROM pg_typ WHERE typname = 'job_status') THEN
CREATE TYPE job_status AS ENUM('open', 'accepted', 'completed', 'expired');
END IF;
IF NOT EXISTS(select 1 FROM pg_typ WHERE typname = 'bid_status') THEN
CREATE TYPE bid_status AS ENUM('pending', 'accepted', 'rejected');
END IF;
END$$; LANGUAGE plpgsql;

-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postcode VARCHAR(10),
    location GEOMETRY(POINT, 4326),
    profile_img TEXT,
    about_me TEXT,
    is_provider BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    skills TEXT[],
    identity_doc_url TEXT
);
CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_location_idx ON users USING GIST (location);

-- Jobs table
CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,
    summary VARCHAR(255) NOT NULL,
    job_detail TEXT,
    category VARCHAR(50),
    created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status job_status DEFAULT 'open',
    accepted_bid INTEGER,
    CONSTRAINT jobs_accepted_bid_fkey
    FOREIGN KEY (accepted_bid) REFERENCES bids(bid_id) ON DELETE SET NULL,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_date DATE,
    completion_date TIMESTAMP,
    photo_url TEXT,
    location GEOMETRY(POINT, 4326)
);
CREATE INDEX jobs_location_idx ON jobs USING GIST (location);
CREATE INDEX jobs_created_by_idx ON jobs (created_by);
CREATE INDEX jobs_status_idx ON jobs (status);

-- Bids table
CREATE TABLE bids (
    bid_id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    provider_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status bid_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX bids_job_id_idx ON bids (job_id);
CREATE INDEX bids_provider_id_idx ON bids (provider_id);

-- Chats table
CREATE TABLE chats (
    chat_id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id),
    user1_id INTEGER NOT NULL REFERENCES users(user_id),
    user2_id INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX chats_job_id_idx ON chats (job_id);
CREATE INDEX chats_user1_idx ON chats (user1_id);
CREATE INDEX chats_user2_idx ON chats (user2_id);

-- Messages table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(chat_id),
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX messages_chat_id_idx ON messages (chat_id);
CREATE INDEX messages_created_at_idx ON messages (created_at);
CREATE INDEX messages_sender_idx ON messages (sender_id);