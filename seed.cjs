//import fs from "fs";
require("dotenv").config({ path: `./.env.${process.env.NODE_ENV || "development"}` });
const { Pool, types } = require("pg");

const ENV = process.env.NODE_ENV || "DEVELOPMENT";

const config = {};
if(ENV === "production"){
    config.connectionstring = process.env.DATABASE_URL;
    config.max = 2
}else {
    config.user = process.env.PGUSER;
    config.password = process.env.PGPASSWORD;
    config.host = process.env.PGHOST;
    config.port = process.env.PGPORT;
    config.database = process.env.PGDATABASE;
}
console.log("Connecting with config:", config);

types.setTypeParser(1082, (value) => value); // Return raw string (YYYY-MM-DD)
types.setTypeParser(1114, (value) => value); // TIMESTAMP
types.setTypeParser(1184, (value) => value); //TIMESTAMPTZ
  
const db = new Pool(config);

async function seed() {
    try{
    await db.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);
console.log("PostGis extension");
    await db.query(`DROP TABLE IF EXISTS messages, chats, bids, jobs, users CASCADE;`);
    console.log("Dropped old tables");
    await db.query(`DROP TYPE IF EXISTS bid_status CASCADE;`);
    console.log("Dropped type bid_status");
    await db.query(`DROP TYPE IF EXISTS job_status CASCADE;`);    
        console.log("Dropped type job_status");
    await db.query(`
        CREATE TYPE job_status AS ENUM ('open', 'accepted', 'completed', 'expired');`);
        console.log("Created type job_status");
    await db.query(`
        CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');`);  
        console.log("Created type bid_status");

 await db.query (`
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
identity_doc_url TEXT);
 `);

await db.query(`
    CREATE TABLE jobs(
    job_id SERIAL PRIMARY KEY,
    summary VARCHAR(255) NOT NULL,
    job_detail TEXT,
    category VARCHAR(50),
    created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status job_status DEFAULT 'open',
    accepted_bid INTEGER,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_date DATE,
    completion_date TIMESTAMP,
    photo_url TEXT,
    location GEOMETRY(POINT, 4326));
    `);


await db.query(`
    CREATE TABLE bids(
    bid_id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    provider_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status bid_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);
    
        console.log("Created table bids")

//await db.query(`
    //ALTER TABLE public.jobs
    //ADD CONSTRAINT jobs_accepted_bid_fkey
    //FOREIGN KEY (accepted_bid) 
    //REFERENCES public.bids(bid_id) 
    //ON DELETE SET NULL;`);
    //console.log("Added FK jobs.accepted_bid");
    
    
 await db.query(`
    CREATE TABLE chats(
    chat_id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id),
    user1_id INTEGER NOT NULL REFERENCES users(user_id),
    user2_id INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
        `);
    console.log("Create table chats");
        
await db.query(`
    CREATE TABLE messages(
    message_id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(chat_id),
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `);
    console.log("Create table messages");

    //await createUsers();
await db.query(`CREATE INDEX users_email_idx ON users (email);`);
console.log("Index users.email")
await db.query(`CREATE INDEX users_location_idx ON users USING GIST (location);`);
console.log("Index users.location");

//await createJobs();
await db.query(`CREATE INDEX jobs_location_idx ON jobs USING GIST (location);`);
console.log("Index jobs.location");
await db.query(`CREATE INDEX jobs_created_by_idx ON jobs (created_by);`);
console.log("Index jobs.created_by"); 
await db.query(`CREATE INDEX jobs_status_idx ON jobs (status);`);  
console.log("Index jobs.status");
//await createBids();
await db.query(`CREATE INDEX bids_job_id_idx ON bids(job_id);`);
console.log("Index bids.job_id");
await db.query(`CREATE INDEX bids_provider_id_idx ON bids(provider_id);`);
console.log("Index bids.provider_id"); 
await db.query(`CREATE INDEX chats_job_id_idx ON chats(job_id)`);
console.log("Index chats.job_id");
await db.query(`CREATE INDEX chats_user1_id_idx ON chats(user1_id)`);
console.log("Index chats.user1_id");
await db.query(`CREATE INDEX chats_user2_id_idx ON chats(user2_id)`);
console.log("Index chats.user2_id");
await db.query(`CREATE INDEX messages_chat_id_idx ON messages(chat_id)`);
console.log("Index messages.chat_id");
await db.query(`CREATE INDEX messages_created_at_idx ON messages(created_at)`);
console.log("Index messages.created_at");
await db.query(`CREATE INDEX messages_sender_idx ON messages(sender_id)`);
console.log("Index messages.sender_id") 

await db.query(`
    INSERT INTO users (user_id, email, password, firstname, lastname, address, city, postcode, location, profile_img, about_me, is_provider, avatar_url, skills, identity_doc_url)
    VALUES
        (1, 'user1@manchester.com', 'pass123', 'Adam', 'Brown', '14 Oxford Road', 'Manchester', 'M1 5EE', ST_PointFromText('POINT(-2.2410 53.4740)', 4326), NULL, 'Looking for local DIY help.', FALSE, NULL, NULL, NULL),
        (2, 'user2@manchester.com', 'pass123', 'Beth', 'Clark', '22 Princess Street', 'Manchester', 'M2 4DG', ST_PointFromText('POINT(-2.2435 53.4790)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (3, 'user3@manchester.com', 'pass123', 'Charlie', 'Davis', '8 Deansgate', 'Manchester', 'M3 2EN', ST_PointFromText('POINT(-2.2480 53.4830)', 4326), NULL, 'Need help with home repairs.', FALSE, NULL, NULL, NULL),
        (4, 'user4@manchester.com', 'pass123', 'Daisy', 'Evans', '55 Whitworth Street', 'Manchester', 'M1 3NT', ST_PointFromText('POINT(-2.2370 53.4750)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (5, 'user5@manchester.com', 'pass123', 'Ethan', 'Fox', '33 Piccadilly', 'Manchester', 'M1 1LQ', ST_PointFromText('POINT(-2.2350 53.4810)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (6, 'user6@manchester.com', 'pass123', 'Fiona', 'Green', '9 Cheetham Hill Road', 'Manchester', 'M4 4FY', ST_PointFromText('POINT(-2.2380 53.4910)', 4326), NULL, 'Looking for gardening help.', FALSE, NULL, NULL, NULL),
        (7, 'user7@manchester.com', 'pass123', 'George', 'Hill', '17 Anson Road', 'Manchester', 'M14 5DA', ST_PointFromText('POINT(-2.2250 53.4540)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (8, 'user8@manchester.com', 'pass123', 'Hannah', 'Irwin', '28 Wilmslow Road', 'Manchester', 'M14 5TQ', ST_PointFromText('POINT(-2.2220 53.4530)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (9, 'user9@manchester.com', 'pass123', 'Isaac', 'Jones', '44 Great Ancoats Street', 'Manchester', 'M4 5AB', ST_PointFromText('POINT(-2.2290 53.4840)', 4326), NULL, 'Need furniture assembly.', FALSE, NULL, NULL, NULL),
        (10, 'user10@manchester.com', 'pass123', 'Jade', 'Kelly', '66 Oldham Street', 'Manchester', 'M4 1LE', ST_PointFromText('POINT(-2.2320 53.4850)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (11, 'user11@manchester.com', 'pass123', 'Kieran', 'Lee', '12 Stockport Road', 'Manchester', 'M12 6AL', ST_PointFromText('POINT(-2.2100 53.4690)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (12, 'user12@manchester.com', 'pass123', 'Laura', 'Mason', '5 Ashton New Road', 'Manchester', 'M11 3TR', ST_PointFromText('POINT(-2.2150 53.4770)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (13, 'user13@manchester.com', 'pass123', 'Max', 'Norris', '19 Ducie Street', 'Manchester', 'M1 2JL', ST_PointFromText('POINT(-2.2330 53.4790)', 4326), NULL, 'Looking for painting services.', FALSE, NULL, NULL, NULL),
        (14, 'user14@manchester.com', 'pass123', 'Nina', 'Owen', '88 Upper Brook Street', 'Manchester', 'M13 9TD', ST_PointFromText('POINT(-2.2270 53.4660)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (15, 'user15@manchester.com', 'pass123', 'Oliver', 'Price', '27 Newton Street', 'Manchester', 'M1 1FT', ST_PointFromText('POINT(-2.2340 53.4830)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (16, 'user16@manchester.com', 'pass123', 'Poppy', 'Quinn', '3 London Road', 'Manchester', 'M1 2BN', ST_PointFromText('POINT(-2.2360 53.4770)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (17, 'user17@manchester.com', 'pass123', 'Ryan', 'Reid', '15 Sackville Street', 'Manchester', 'M1 3DU', ST_PointFromText('POINT(-2.2380 53.4760)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (18, 'user18@manchester.com', 'pass123', 'Sophie', 'Shaw', '9 Portland Street', 'Manchester', 'M1 3BE', ST_PointFromText('POINT(-2.2390 53.4790)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (19, 'user19@manchester.com', 'pass123', 'Tom', 'Turner', '22 Chorlton Street', 'Manchester', 'M1 3HW', ST_PointFromText('POINT(-2.2410 53.4770)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (20, 'user20@manchester.com', 'pass123', 'Vicky', 'Underwood', '11 Hulme Street', 'Manchester', 'M1 5GL', ST_PointFromText('POINT(-2.2460 53.4730)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (21, 'user21@manchester.com', 'pass123', 'Will', 'Vaughan', '33 Ardwick Green', 'Manchester', 'M12 6DL', ST_PointFromText('POINT(-2.2240 53.4720)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (22, 'user22@manchester.com', 'pass123', 'Xena', 'Walker', '8 Tariff Street', 'Manchester', 'M1 2FF', ST_PointFromText('POINT(-2.2310 53.4820)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (23, 'user23@manchester.com', 'pass123', 'Yvonne', 'Young', '55 Mosley Street', 'Manchester', 'M2 3HQ', ST_PointFromText('POINT(-2.2420 53.4800)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (24, 'user24@manchester.com', 'pass123', 'Zoe', 'Adams', '17 Lever Street', 'Manchester', 'M1 1AN', ST_PointFromText('POINT(-2.2350 53.4840)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (25, 'user25@manchester.com', 'pass123', 'Aaron', 'Bell', '29 Thomas Street', 'Manchester', 'M4 1NA', ST_PointFromText('POINT(-2.2360 53.4860)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (26, 'user26@manchester.com', 'pass123', 'Bella', 'Carter', '14 Dale Street', 'Manchester', 'M1 1JA', ST_PointFromText('POINT(-2.2340 53.4810)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (27, 'user27@manchester.com', 'pass123', 'Chris', 'Dean', '6 Canal Street', 'Manchester', 'M1 3HE', ST_PointFromText('POINT(-2.2370 53.4780)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (28, 'user28@manchester.com', 'pass123', 'Diana', 'Ellis', '18 Brazil Street', 'Manchester', 'M1 3PJ', ST_PointFromText('POINT(-2.2400 53.4760)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (29, 'user29@manchester.com', 'pass123', 'Eddie', 'Fisher', '9 Blossom Street', 'Manchester', 'M4 6AP', ST_PointFromText('POINT(-2.2260 53.4860)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (30, 'user30@manchester.com', 'pass123', 'Freya', 'Gibson', '25 George Street', 'Manchester', 'M1 4HQ', ST_PointFromText('POINT(-2.2430 53.4790)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (31, 'user31@manchester.com', 'pass123', 'Gary', 'Harris', '11 Edge Street', 'Manchester', 'M4 1HW', ST_PointFromText('POINT(-2.2350 53.4850)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (32, 'user32@manchester.com', 'pass123', 'Holly', 'Ingram', '20 Hilton Street', 'Manchester', 'M1 1FR', ST_PointFromText('POINT(-2.2320 53.4830)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (33, 'user33@manchester.com', 'pass123', 'Ian', 'James', '7 Turner Street', 'Manchester', 'M4 1DQ', ST_PointFromText('POINT(-2.2370 53.4860)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (34, 'user34@manchester.com', 'pass123', 'Jasmine', 'King', '15 High Street', 'Manchester', 'M4 1EA', ST_PointFromText('POINT(-2.2380 53.4850)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (35, 'user35@manchester.com', 'pass123', 'Kyle', 'Lloyd', '22 Bridge Street', 'Manchester', 'M3 3AB', ST_PointFromText('POINT(-2.2490 53.4810)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (36, 'user36@manchester.com', 'pass123', 'Lydia', 'Moore', '30 John Dalton Street', 'Manchester', 'M2 6HY', ST_PointFromText('POINT(-2.2450 53.4800)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (37, 'user37@manchester.com', 'pass123', 'Mason', 'Neal', '8 Quay Street', 'Manchester', 'M3 3JE', ST_PointFromText('POINT(-2.2500 53.4790)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (38, 'user38@manchester.com', 'pass123', 'Nia', 'Oliver', '16 Stevenson Square', 'Manchester', 'M1 1PT', ST_PointFromText('POINT(-2.2330 53.4840)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (39, 'user39@manchester.com', 'pass123', 'Oscar', 'Parker', '5 Booth Street', 'Manchester', 'M2 4AF', ST_PointFromText('POINT(-2.2420 53.4780)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (40, 'user40@manchester.com', 'pass123', 'Phoebe', 'Rose', '12 Market Street', 'Manchester', 'M1 1PT', ST_PointFromText('POINT(-2.2400 53.4820)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (41, 'provider1@manchester.com', 'pass123', 'Quinn', 'Scott', '9 York Street', 'Manchester', 'M2 3AW', ST_PointFromText('POINT(-2.2430 53.4770)', 4326), NULL, 'Experienced plumber.', TRUE, NULL, ARRAY['plumbing', 'repairs'], 'https://example.com/id/quinn.pdf'),
        (42, 'provider2@manchester.com', 'pass123', 'Rachel', 'Taylor', '18 King Street', 'Manchester', 'M2 6AG', ST_PointFromText('POINT(-2.2450 53.4810)', 4326), NULL, 'Gardening specialist.', TRUE, NULL, ARRAY['gardening', 'landscaping'], 'https://example.com/id/rachel.pdf'),
        (43, 'provider3@manchester.com', 'pass123', 'Sam', 'Upton', '27 Deansgate', 'Manchester', 'M3 4EW', ST_PointFromText('POINT(-2.2480 53.4820)', 4326), NULL, 'Electrician with 10 years experience.', TRUE, NULL, ARRAY['electrical', 'repairs'], 'https://example.com/id/sam.pdf'),
        (44, 'provider4@manchester.com', 'pass123', 'Tara', 'Vance', '33 Oxford Street', 'Manchester', 'M1 4EL', ST_PointFromText('POINT(-2.2400 53.4740)', 4326), NULL, 'Painter and decorator.', TRUE, NULL, ARRAY['painting', 'decorating'], 'https://example.com/id/tara.pdf'),
        (45, 'provider5@manchester.com', 'pass123', 'Umar', 'Wilson', '8 Piccadilly Place', 'Manchester', 'M1 3BR', ST_PointFromText('POINT(-2.2360 53.4800)', 4326), NULL, 'Furniture assembly expert.', TRUE, NULL, ARRAY['assembly', 'moving'], 'https://example.com/id/umar.pdf'),
        (46, 'provider6@manchester.com', 'pass123', 'Vera', 'Young', '14 Whitworth Street West', 'Manchester', 'M1 5ND', ST_PointFromText('POINT(-2.2410 53.4730)', 4326), NULL, 'Carpentry specialist.', TRUE, NULL, ARRAY['carpentry', 'repairs'], 'https://example.com/id/vera.pdf'),
        (47, 'provider7@manchester.com', 'pass123', 'Wade', 'Zane', '22 Great Ancoats Street', 'Manchester', 'M4 5AZ', ST_PointFromText('POINT(-2.2290 53.4830)', 4326), NULL, 'General handyman.', TRUE, NULL, ARRAY['repairs', 'plumbing'], 'https://example.com/id/wade.pdf'),
        (48, 'provider8@manchester.com', 'pass123', 'Xander', 'Adams', '11 Oldham Road', 'Manchester', 'M4 5EA', ST_PointFromText('POINT(-2.2310 53.4870)', 4326), NULL, 'Landscaping and gardening.', TRUE, NULL, ARRAY['gardening', 'landscaping'], 'https://example.com/id/xander.pdf'),
        (49, 'provider9@manchester.com', 'pass123', 'Yara', 'Bell', '19 Wilmslow Road', 'Manchester', 'M14 5AQ', ST_PointFromText('POINT(-2.2230 53.4540)', 4326), NULL, 'Electrical and lighting.', TRUE, NULL, ARRAY['electrical', 'lighting'], 'https://example.com/id/yara.pdf'),
        (50, 'provider10@manchester.com', 'pass123', 'Zach', 'Carter', '7 Anson Road', 'Manchester', 'M14 5BQ', ST_PointFromText('POINT(-2.2250 53.4530)', 4326), NULL, 'Painting and plastering.', TRUE, NULL, ARRAY['painting', 'plastering'], 'https://example.com/id/zach.pdf'),
        (51, 'alice@ukmail.com', 'hashedpw1', 'Alice', 'Smith', '12 Rose Lane', 'London', 'E1 6AN', ST_PointFromText('POINT(-0.0754 51.5202)', 4326), NULL, 'Looking for help with house repairs.', FALSE, NULL, NULL, NULL),
        (52, 'ben@ukmail.com', 'hashedpw2', 'Ben', 'Taylor', '88 King Street', 'Manchester', 'M1 4AH', ST_PointFromText('POINT(-2.2416 53.4794)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (53, 'carol@ukmail.com', 'hashedpw3', 'Carol', 'Lewis', '23 Elm Grove', 'Birmingham', 'B15 2TT', ST_PointFromText('POINT(-1.8998 52.4862)', 4326), NULL, 'Student needing some moving help.', FALSE, NULL, NULL, NULL),
        (54, 'dan@ukmail.com', 'hashedpw4', 'Dan', 'Khan', '45 Maple Drive', 'London', 'E2 7QL', ST_PointFromText('POINT(-0.0631 51.5270)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (55, 'ella@ukmail.com', 'hashedpw5', 'Ella', 'Ward', '5 The Crescent', 'Leeds', 'LS6 3DS', ST_PointFromText('POINT(-1.5605 53.8098)', 4326), NULL, NULL, FALSE, NULL, NULL, NULL),
        (56, 'finn@ukmail.com', 'hashedpw6', 'Finn', 'Evans', '9 Oak Road', 'Glasgow', 'G12 8QQ', ST_PointFromText('POINT(-4.2891 55.8721)', 4326), NULL, 'Gardening and landscaping expert.', TRUE, NULL, ARRAY['gardening', 'landscaping'], 'https://example.com/id/finn.pdf'),
        (57, 'grace@ukmail.com', 'hashedpw7', 'Grace', 'Morgan', '77 Birch Avenue', 'Manchester', 'M3 5BW', ST_PointFromText('POINT(-2.2500 53.4839)', 4326), NULL, 'Certified electrician and painter.', TRUE, NULL, ARRAY['electrical', 'painting'], 'https://example.com/id/grace.pdf'),
        (58, 'harry@ukmail.com', 'hashedpw8', 'Harry', 'Wells', '34 Pine Close', 'Bristol', 'BS1 5EH', ST_PointFromText('POINT(-2.5950 51.4545)', 4326), NULL, 'Handyman with 5+ years of experience.', TRUE, NULL, ARRAY['plumbing', 'carpentry'], 'https://example.com/id/harry.pdf'),
        (59, 'isla@ukmail.com', 'hashedpw9', 'Isla', 'Reid', '13 Park Row', 'Leeds', 'LS1 5HD', ST_PointFromText('POINT(-1.5486 53.7965)', 4326), NULL, 'Furniture assembly and removals.', TRUE, NULL, ARRAY['moving', 'assembly'], 'https://example.com/id/isla.pdf'),
        (60, 'jack@ukmail.com', 'hashedpw10', 'Jack', 'Foster', '51 Abbey Road', 'Bristol', 'BS2 0JA', ST_PointFromText('POINT(-2.5811 51.4640)', 4326), NULL, 'General repair specialist.', TRUE, NULL, ARRAY['repairs', 'painting'], 'https://example.com/id/jack.pdf');
         `);
        
    await db.query(`
        INSERT INTO jobs (job_id, summary, job_detail, category, created_by, status, accepted_bid, date_posted, target_date, completion_date, photo_url, location)
        VALUES
        (1, 'Fix kitchen sink', 'Leaking pipe under kitchen sink needs repair.', 'Plumbing', 1, 'open', NULL, '2025-04-15T10:00:00Z', '2025-04-25', NULL, 'https://example.com/photos/sink.jpg', ST_PointFromText('POINT(-2.2410 53.4740)', 4326)),
        (2, 'Mow lawn', 'Front and back lawn need mowing and trimming.', 'Gardening', 2, 'open', NULL, '2025-04-15T11:00:00Z', '2025-04-26', NULL, 'https://example.com/photos/lawn2.jpg', ST_PointFromText('POINT(-2.2435 53.4790)', 4326)),
        (3, 'Install light fixture', 'Replace old ceiling light with new fixture.', 'Electrical', 2, 'accepted', 5, '2025-04-15T12:00:00Z', '2025-04-27', NULL, 'https://example.com/photos/light.jpg', ST_PointFromText('POINT(-2.2480 53.4830)', 4326)),
        (4, 'Paint bedroom', 'Paint two walls and ceiling in small bedroom.', 'Painting', 4, 'open', NULL, '2025-04-15T13:00:00Z', '2025-04-28', NULL, 'https://example.com/photos/bedroom.jpg', ST_PointFromText('POINT(-2.2370 53.4750)', 4326)),
        (5, 'Assemble wardrobe', 'Flat-pack wardrobe needs assembly.', 'Assembly', 5, 'open', NULL, '2025-04-15T14:00:00Z', '2025-04-29', NULL, 'https://example.com/photos/wardrobe.jpg', ST_PointFromText('POINT(-2.2350 53.4810)', 4326)),
        (6, 'Repair garden fence', 'Two fence panels need replacing.', 'Carpentry', 6, 'open', NULL, '2025-04-15T15:00:00Z', '2025-04-30', NULL, 'https://example.com/photos/fence.jpg', ST_PointFromText('POINT(-2.2380 53.4910)', 4326)),
        (7, 'Fix bathroom tap', 'Dripping tap in bathroom needs new washer.', 'Plumbing', 7, 'open', NULL, '2025-04-15T16:00:00Z', '2025-05-01', NULL, 'https://example.com/photos/tap2.jpg', ST_PointFromText('POINT(-2.2250 53.4540)', 4326)),
        (8, 'Landscape garden', 'Redesign small garden with new plants.', 'Gardening', 8, 'open', NULL, '2025-04-15T17:00:00Z', '2025-05-02', NULL, 'https://example.com/photos/garden.jpg', ST_PointFromText('POINT(-2.2220 53.4530)', 4326)),
        (9, 'Wall plastering', 'Plaster one wall in living room.', 'Plastering', 9, 'open', NULL, '2025-04-15T18:00:00Z', '2025-05-03', NULL, 'https://example.com/photos/plaster.jpg', ST_PointFromText('POINT(-2.2290 53.4840)', 4326)),
        (10, 'Mount TV on wall', 'Install TV bracket and mount 55-inch TV.', 'Assembly', 10, 'open', NULL, '2025-04-15T19:00:00Z', '2025-05-04', NULL, 'https://example.com/photos/tv.jpg', ST_PointFromText('POINT(-2.2320 53.4850)', 4326)),
        (11, 'Fix leaky tap', 'Bathroom tap is leaking and needs a washer replaced.', 'Plumbing', 51, 'open', 52, '2025-04-12T10:00:00Z', '2025-04-18', NULL, 'https://example.com/photos/tap.jpg', ST_PointFromText('POINT(-0.0754 51.5202)', 4326)),
        (12, 'Lawn mowing service', 'Front and back garden need mowing.', 'Gardening', 52, 'accepted', 25, '2025-04-12T11:00:00Z', '2025-04-19', NULL, 'https://example.com/photos/lawn.jpg', ST_PointFromText('POINT(-2.2416 53.4794)', 4326)),
        (13, 'Assemble IKEA furniture', 'Need help assembling wardrobe and desk.', 'Assembly', 53, 'accepted', 26, '2025-04-12T12:00:00Z', '2025-04-21', NULL, 'https://example.com/photos/furniture.jpg', ST_PointFromText('POINT(-1.8998 52.4862)', 4326)),
        (14, 'Paint living room', 'One coat of paint for walls and ceiling.', 'Painting', 54, 'completed', 29, '2025-04-12T13:00:00Z', '2025-04-22', NULL, 'https://example.com/photos/paint.jpg', ST_PointFromText('POINT(-0.0631 51.5270)', 4326)),
        (15, 'Electric socket repair', 'Faulty socket needs fixing in kitchen.', 'Electrical', 55, 'completed', 30, '2025-04-12T14:00:00Z', '2025-04-24', NULL, 'https://example.com/photos/socket.jpg', ST_PointFromText('POINT(-1.5605 53.8098)', 4326)),
        (16, 'Replace broken window', 'Fix cracked window in living room.', 'Repairs', 11, 'completed', 33, '2025-04-01T09:00:00Z', '2025-04-10', '2025-04-09T15:00:00Z', 'https://example.com/photos/window.jpg', ST_PointFromText('POINT(-2.2100 53.4690)', 4326)),
        (17, 'Install new shelves', 'Mount three floating shelves in study.', 'Carpentry', 12, 'completed', 35, '2025-04-02T10:00:00Z', '2025-04-12', '2025-04-11T14:00:00Z', 'https://example.com/photos/shelves.jpg', ST_PointFromText('POINT(-2.2150 53.4770)', 4326)),
        (18, 'Clean gutters', 'Clear leaves and debris from house gutters.', 'Gardening', 13, 'expired', NULL, '2025-03-01T08:00:00Z', '2025-03-15', NULL, 'https://example.com/photos/gutters.jpg', ST_PointFromText('POINT(-2.2330 53.4790)', 4326)),
        (19, 'Repair roof leak', 'Fix leak in roof near chimney.', 'Repairs', 14, 'expired', NULL, '2025-03-05T09:00:00Z', '2025-03-20', NULL, 'https://example.com/photos/roof.jpg', ST_PointFromText('POINT(-2.2270 53.4660)', 4326)),
        (20, 'Rewire bedroom lights', 'Update wiring for bedroom ceiling lights.', 'Electrical', 15, 'completed', 41, '2025-04-03T11:00:00Z', '2025-04-15', '2025-04-14T16:00:00Z', 'https://example.com/photos/lights.jpg', ST_PointFromText('POINT(-2.2340 53.4830)', 4326));
        `)
        
        
    await db.query(`
         INSERT INTO bids (bid_id, job_id, amount, provider_id, status, created_at)
         VALUES
         (1, 1, 50.00, 41, 'pending', '2025-04-16T10:00:00Z'), -- Quinn (plumber) on Fix kitchen sink
         (2, 1, 45.00, 47, 'pending', '2025-04-16T11:00:00Z'), -- Wade (handyman) on Fix kitchen sink
         (3, 2, 30.00, 42, 'pending', '2025-04-16T12:00:00Z'), -- Rachel (gardener) on Mow lawn
         (4, 2, 35.00, 48, 'pending', '2025-04-16T13:00:00Z'), -- Xander (gardener) on Mow lawn
         (5, 3, 70.00, 43, 'accepted', '2025-04-16T14:00:00Z'), -- Sam (electrician) on Install light fixture
         (6, 3, 65.00, 49, 'pending', '2025-04-16T15:00:00Z'), -- Yara (electrician) on Install light fixture
         (7, 4, 100.00, 44, 'pending', '2025-04-16T16:00:00Z'), -- Tara (painter) on Paint bedroom
         (8, 4, 90.00, 50, 'pending', '2025-04-16T17:00:00Z'), -- Zach (painter) on Paint bedroom
         (9, 5, 60.00, 45, 'pending', '2025-04-16T18:00:00Z'), -- Umar (assembly) on Assemble wardrobe
         (10, 5, 55.00, 59, 'pending', '2025-04-16T19:00:00Z'), -- Isla (assembly) on Assemble wardrobe
         (11, 6, 80.00, 46, 'pending', '2025-04-17T10:00:00Z'), -- Vera (carpenter) on Repair garden fence
         (12, 6, 85.00, 58, 'pending', '2025-04-17T11:00:00Z'), -- Harry (carpenter) on Repair garden fence
         (13, 7, 40.00, 41, 'pending', '2025-04-17T12:00:00Z'), -- Quinn (plumber) on Fix bathroom tap
         (14, 7, 35.00, 47, 'pending', '2025-04-17T13:00:00Z'), -- Wade (handyman) on Fix bathroom tap
         (15, 8, 120.00, 42, 'pending', '2025-04-17T14:00:00Z'), -- Rachel (gardener) on Landscape garden
         (16, 8, 110.00, 48, 'pending', '2025-04-17T15:00:00Z'), -- Xander (gardener) on Landscape garden
         (17, 9, 90.00, 50, 'pending', '2025-04-17T16:00:00Z'), -- Zach (plastering) on Wall plastering
         (18, 9, 95.00, 44, 'pending', '2025-04-17T17:00:00Z'), -- Tara (decorator) on Wall plastering
         (19, 10, 50.00, 45, 'pending', '2025-04-17T18:00:00Z'), -- Umar (assembly) on Mount TV on wall
         (20, 10, 45.00, 59, 'pending', '2025-04-17T19:00:00Z'), -- Isla (assembly) on Mount TV on wall
         (21, 11, 45.00, 57, 'pending', '2025-04-13T10:00:00Z'), -- Grace on Fix leaky tap
         (22, 11, 40.00, 58, 'accepted', '2025-04-13T11:00:00Z'), -- Harry on Fix leaky tap
         (23, 12, 60.00, 56, 'pending', '2025-04-13T12:00:00Z'), -- Finn on Lawn mowing service
         (24, 12, 55.00, 59, 'rejected', '2025-04-13T13:00:00Z'), -- Isla on Lawn mowing service
         (25, 12, 50.00, 60, 'accepted', '2025-04-13T14:00:00Z'), -- Jack on Lawn mowing service
         (26, 13, 70.00, 59, 'accepted', '2025-04-13T15:00:00Z'), -- Isla on Assemble IKEA furniture
         (27, 13, 75.00, 56, 'pending', '2025-04-13T16:00:00Z'), -- Finn on Assemble IKEA furniture
         (28, 14, 120.00, 57, 'pending', '2025-04-13T17:00:00Z'), -- Grace on Paint living room
         (29, 14, 110.00, 60, 'accepted', '2025-04-13T18:00:00Z'), -- Jack on Paint living room
         (30, 15, 90.00, 57, 'accepted', '2025-04-13T19:00:00Z'), -- Grace on Electric socket repair
         (31, 15, 85.00, 58, 'rejected', '2025-04-13T20:00:00Z'), -- Harry on Electric socket repair
         (32, 15, 95.00, 56, 'pending', '2025-04-13T21:00:00Z'), -- Finn on Electric socket repair
         (33, 16, 150.00, 47, 'accepted', '2025-04-02T10:00:00Z'), -- Wade on Replace broken window (completed)
         (34, 16, 160.00, 41, 'rejected', '2025-04-02T11:00:00Z'), -- Quinn on Replace broken window
         (35, 17, 80.00, 46, 'accepted', '2025-04-03T10:00:00Z'), -- Vera on Install new shelves (completed)
         (36, 17, 85.00, 58, 'rejected', '2025-04-03T11:00:00Z'), -- Harry on Install new shelves
         (37, 18, 40.00, 42, 'pending', '2025-03-02T10:00:00Z'), -- Rachel on Clean gutters (expired)
         (38, 18, 45.00, 48, 'pending', '2025-03-02T11:00:00Z'), -- Xander on Clean gutters
         (39, 19, 200.00, 47, 'pending', '2025-03-06T10:00:00Z'), -- Wade on Repair roof leak (expired)
         (40, 19, 210.00, 41, 'pending', '2025-03-06T11:00:00Z'), -- Quinn on Repair roof leak
         (41, 20, 100.00, 43, 'accepted', '2025-04-04T10:00:00Z'), -- Sam on Rewire bedroom lights (completed)
         (42, 20, 110.00, 49, 'rejected', '2025-04-04T11:00:00Z'); -- Yara on Rewire bedroom lights
        `);
        
    await db.query(`
        SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
        SELECT setval('jobs_job_id_seq', (SELECT MAX(job_id) FROM jobs));
        SELECT setval('bids_bid_id_seq', (SELECT MAX(bid_id) FROM bids));
        `);
    
        console.log("Schema creation complete - now add inserts");
//await populateUsers();
//await populateJobs();
//await populateBids();

//await resetCounters();

console.log("Seed completed successfully");
}
catch(err) {
        console.error("Schema build failed:", err);
        process.exit(1);
        //await db.query("RollBack");
        //throw err;
    }finally {
        await db.end();
    }

    }

seed();

