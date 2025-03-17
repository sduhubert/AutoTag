-- CREATION OF TABLES --

CREATE TABLE "user" (
    userid SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    "password" VARCHAR(255) NOT NULL
);

CREATE TABLE admin (
    adminid SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    "password" VARCHAR(255) NOT NULL
);

CREATE TABLE video (
    videoid SERIAL PRIMARY KEY,
    userid INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    duration INTERVAL NOT NULL, -- Duration in HH:MM:SS format
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES "user"(userid)
    -- video stays even if user is deleted
);

CREATE TABLE audio (
    audioid SERIAL PRIMARY KEY,
    userid INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    duration INTERVAL NOT NULL, -- Duration in HH:MM:SS format
    -- duration INT NOT NULL, -- Duration in seconds, which is another option, 
    -- but HH:MM:SS is probably better
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES "user"(userid)
    -- audio stays even if user is deleted
);

CREATE TABLE tag (
    tagid SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE video_tag (
    videoid INT NOT NULL,
    tagid INT NOT NULL,
    PRIMARY KEY (videoid, tagid),
    FOREIGN KEY (videoid) REFERENCES video(videoid) ON DELETE CASCADE, 
    --associated tag is deleted when video is deleted
    FOREIGN KEY (tagid) REFERENCES tag(tagid) ON DELETE CASCADE
);

CREATE TABLE audio_tag (
    audioid INT NOT NULL,
    tagid INT NOT NULL,
    PRIMARY KEY (audioid, tagid),
    FOREIGN KEY (audioid) REFERENCES audio(audioid) ON DELETE CASCADE,
    -- associated tag is deleted when audio is deleted
    FOREIGN KEY (tagid) REFERENCES tag(tagid) ON DELETE CASCADE
);

-- (Audio and video) content summary --

CREATE TABLE video_summary (
    summaryid SERIAL PRIMARY KEY,
    videoid INT NOT NULL,
    summary TEXT NOT NULL,
    FOREIGN KEY (videoid) REFERENCES video(videoid) ON DELETE CASCADE
);

CREATE TABLE audio_summary (
    summaryid SERIAL PRIMARY KEY,
    audioid INT NOT NULL,
    summary TEXT NOT NULL,
    FOREIGN KEY (audioid) REFERENCES audio(audioid) ON DELETE CASCADE
);

-- MOCK DATA, will be changed to real data eventually --

INSERT INTO "user" (email, username, "password") VALUES 
('user1@gmail.com', 'user1', 'password1'),
('user2@gmail.com', 'user2', 'password2');

INSERT INTO admin (email, username, "password") VALUES
('admin@gmail.com', 'admin', 'admin1');

INSERT INTO video (userid, title, description, url, duration) VALUES
(1, 'My First Video', 'This is a sample video.', 'https://example.com/video1.mp4', '01:00:00'),
(2, 'Nature Documentary', 'A beautiful nature documentary.', 'https://example.com/video2.mp4', '01:30:00');

INSERT INTO audio (userid, title, description, url, duration) VALUES
(1, 'Podcast Episode 1', 'A discussion about technology.', 'https://example.com/audio1.mp3', '00:30:00'),
(2, 'Music Track', 'An original music piece.', 'https://example.com/audio2.mp3', '00:04:00');

INSERT INTO tag (name) VALUES 
('Education'),
('Entertainment'),
('Technology'),
('Music'),
('Electronic'), 
('Jazz'), 
('Synthwave'), 
('Rock'), 
('Classical'), 
('Live Performance'), 
('Instrumental'), 
('DJ Set'), 
('Guitar Solo'), 
('Piano');

INSERT INTO video_tag (videoid, tagid) VALUES 
(1, 1), (1, 8), 
(2, 2), (2, 6), 
(3, 3), (3, 6), 
(4, 4), (4, 9), 
(5, 5), (5, 10);

INSERT INTO audio_tag (audioid, tagid) VALUES 
(1, 1), (1, 7), 
(2, 2), (2, 7), 
(3, 3), (3, 7), 
(4, 4), (4, 9), 
(5, 5), (5, 10);

-- Insert mock data for video summaries
INSERT INTO video_summary (videoid, summary) VALUES
(1, 'A full-length DJ set recorded live in Ibiza with house and trance music.'),
(2, 'A jazz masterclass showcasing improvisation techniques on the saxophone.');

-- Insert mock data for audio summaries
INSERT INTO audio_summary (audioid, summary) VALUES
(1, 'A deep electronic symphony with a mix of ambient and techno elements.'),
(2, 'Smooth jazz night vibes, featuring saxophone and piano solos.'),
(3, 'A podcast discussing the latest trends in technology and innovation.'),
(4, 'An original music piece blending classical and electronic elements.'),
(5, 'A live DJ set recorded at a music festival, with vibrant house beats.');