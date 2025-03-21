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
    filepath VARCHAR(255) NOT NULL, -- stores path ("frontend/assets/video...")
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
    filepath VARCHAR(255) NOT NULL, -- stores path ("frontend/assets/audio...")
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

CREATE TABLE language (
    languageid SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE video_language (
    videoid INT NOT NULL,
    languageid INT NOT NULL,
    PRIMARY KEY (videoid, languageid),
    FOREIGN KEY (videoid) REFERENCES video(videoid) ON DELETE CASCADE,
    FOREIGN KEY (languageid) REFERENCES language(languageid)
);

CREATE TABLE audio_language (
    audioid INT NOT NULL,
    languageid INT NOT NULL,
    PRIMARY KEY (audioid, languageid),
    FOREIGN KEY (audioid) REFERENCES audio(audioid) ON DELETE CASCADE,
    FOREIGN KEY (languageid) REFERENCES language(languageid)
);

CREATE TABLE accent (
    accentid SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE video_accent (
    videoid INT NOT NULL,
    accentid INT NOT NULL,
    PRIMARY KEY (videoid, accentid),
    FOREIGN KEY (videoid) REFERENCES video(videoid) ON DELETE CASCADE,
    FOREIGN KEY (accentid) REFERENCES accent(accentid)
);

CREATE TABLE audio_accent (
    audioid INT NOT NULL,
    accentid INT NOT NULL,
    PRIMARY KEY (audioid, accentid),
    FOREIGN KEY (audioid) REFERENCES audio(audioid) ON DELETE CASCADE,
    FOREIGN KEY (accentid) REFERENCES accent(accentid)
);

-- MOCK DATA, will be changed to real data eventually --

INSERT INTO "user" (email, username, "password") VALUES 
('user1@gmail.com', 'user1', 'password1'),
('user2@gmail.com', 'user2', 'password2');

INSERT INTO admin (email, username, "password") VALUES
('admin@gmail.com', 'admin', 'admin1');

INSERT INTO video (userid, title, description, duration) VALUES
(1, 'Clap clap kids - LA VACA LOLA', 'Spanish Kids Song', '00:01:46'),
(2, 'Learn Italian with Luca!', 'Learn Italian with Pixar', '00:02:47'),
(1, '5 Amazing Facts About Vivaldi', 'History Brought to Life', '00:06:32');

INSERT INTO audio (userid, title, description, duration) VALUES
(1, 'Greetings in French 🇫🇷', 'Learn French', '00:02:02'),
(2, 'Danish National Anthem', 'Denmark National Anthem', '00:03:17'),
(1, 'The Pencils Tale', 'A story that everyone should hear', '00:02:06'),
(2, 'Tommy Cash - Espresso Macchiato', 'Estonia, Eurovision 2025', '00:03:12'),
(1, 'Can you understand Indian English Accent?', 'Funny video', '00:00:26'),
(2, 'I Can Play on the Beat', 'Instrument song for toddlers', '00:01:51'),
(1, 'Meet Vivaldi', 'Composer Biography for Kids', '00:02:02'),
(2, 'Music Theory Lessons for Kids', 'Tempo!', '00:04:35'),
(1, 'nublu x gameboy tetris', 'Für Oksana song', '00:04:02'),
(2, '[Sw@da x Niczos] Lusterka', 'Polish song, Eurovision', '00:02:37');

INSERT INTO tag (name) VALUES 
('Education'),
('Entertainment'),
('Music'),
('Kids'),
('Learning'),
('Motivation'),
('National Anthem'),
('Eurovision'),
('Instrumental'),
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

INSERT INTO video_tag (videoid, tagid) VALUES -- tagid is a second number in each braces
(1, 3), (1, 4), -- Clap Clap Kids (Music, Kids)
(2, 1), (2, 5), -- Pixar (Education, Learning)
(3, 1), (3, 2); -- Vivaldi (Education, Entertainment)

INSERT INTO audio_tag (audioid, tagid) VALUES -- tagid is a second number in each braces
(1, 1), (1, 5), -- Learn French (Education, Learning)
(2, 7),         -- Danish National Anthem (National Anthem)
(3, 6),         -- The Pencils Tale (Motivation)
(4, 8),         -- Eurovision (Eurovision)
(5, 2),         -- Indian English Accent (Entertainment)
(6, 3), (6, 9), -- KindyRock (Music, Instrumental)
(7, 1),         -- Meet Vivaldi (Education)
(8, 3),         -- Music Theory (Music)
(9, 3),         -- Gameboy Tetris (Music)
(10, 3);        -- Lusterka (Music)

-- Insert mock data for video summaries
INSERT INTO video_summary (videoid, summary) VALUES
(1, 'A fun and energetic Spanish kids'' song with catchy beats and simple lyrics, perfect for young children to sing along to while learning new words in Spanish.'),
(2, 'An engaging and entertaining Italian language lesson featuring Luca, a Pixar-style character who helps viewers learn basic Italian phrases through a fun, animated adventure.'),
(3, 'Discover five fascinating facts about Antonio Vivaldi, the legendary composer, as we explore his life, music, and lasting influence on classical music.');

-- Insert mock data for audio summaries
INSERT INTO audio_summary (audioid, summary) VALUES
(1, 'A beginner-friendly French lesson that teaches basic greetings and common phrases, designed for those starting to learn the language.'),
(2, 'The traditional Danish national anthem, "Der er et yndigt land," featuring a solemn and patriotic melody that has been a symbol of Denmark for centuries.'),
(3, 'A motivational audio story about the importance of resilience, perseverance, and learning from life''s challenges, narrated with an inspiring tone.'),
(4, 'A quirky and catchy pop track from Tommy Cash, blending rap, electronic beats, and unique soundscapes, with a humorous and offbeat vibe.'),
(5, 'A humorous and engaging exploration of the Indian English accent, featuring examples of unique phrases and pronunciations, making it a fun listen for language enthusiasts.'),
(6, 'A playful and upbeat instrumental song aimed at toddlers, with simple rhythms and sounds to help young children develop their sense of timing and rhythm.'),
(7, 'An engaging introduction to the life and works of Antonio Vivaldi, designed for children and young learners, with exciting facts and music samples.'),
(8, 'A kid-friendly lesson introducing basic music theory concepts, including rhythm, melody, and harmony, aimed at sparking interest in music education for young listeners.'),
(9, 'A retro-inspired electronic track featuring elements of 8-bit music, blended with modern beats and synths, evoking the feeling of a classic video game soundtrack.'),
(10, 'A catchy and vibrant track from Sw@da and Niczos, combining elements of Polish pop and electronic music, with an energetic and fun vibe, perfect for dancing.');

-- Insert languages
INSERT INTO language (name) VALUES 
('English'),
('French'),
('Spanish'),
('Danish'),
('Estonian'),
('Polish'),
('Italian'),
('Hindi');

INSERT INTO video_language (videoid, languageid) VALUES 
(1, 3),  -- Spanish (Clap Clap Kids)
(2, 7),  -- Italian (Pixar)
(3, 1);  -- English (Vivaldi Facts)

INSERT INTO audio_language (audioid, languageid) VALUES 
(1, 2),  -- French (Learn French)
(2, 4),  -- Danish (Danish Anthem)
(3, 1),  -- English (The Pencils Tale)
(9, 5);  -- Estonian (nublu x gameboy tetris)

INSERT INTO accent (name) VALUES 
('British'),
('American'),
('Indian'),
('Australian'),
('French'),
('Danish'),
('Italian'),
('Spanish');

-- Link videos to accents
INSERT INTO video_accent (videoid, accentid) VALUES 
(1, 8),  -- Spanish (Clap Clap Kids)
(2, 7),  -- Italian (Pixar)
(3, 2);  -- American (Vivaldi Facts)

-- Link audios to accents
INSERT INTO audio_accent (audioid, accentid) VALUES 
(1, 5),  -- French (Learn French)
(5, 3);  -- Indian (Can you understand Indian English Accent?)