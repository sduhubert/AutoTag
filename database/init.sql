-- CREATION OF TABLES --

CREATE TABLE "user" (
    "userid" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "username" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL
);

CREATE TABLE "admin" (
    "adminid" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "username" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL
);

CREATE TABLE "video" (
    "videoid" SERIAL PRIMARY KEY,
    "userid" INT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "filepath" VARCHAR(255) NOT NULL, -- stores path ("frontend/assets/video...")
    "duration" INTERVAL NOT NULL, -- Duration in HH:MM:SS format
    "uploaded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userid") REFERENCES "user"("userid")
    -- video stays even if user is deleted
);

CREATE TABLE "tag" (
    "tagid" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) UNIQUE NOT NULL
);

-- table that connects tags with videos (by their id's)
CREATE TABLE "video_tag" (
    "videoid" INT NOT NULL,
    "tagid" INT NOT NULL,
    FOREIGN KEY ("videoid") REFERENCES "video"("videoid") ON DELETE CASCADE, 
    -- associated tag is deleted when video is deleted
    FOREIGN KEY ("tagid") REFERENCES "tag"("tagid") ON DELETE CASCADE
);

-- content summary --
CREATE TABLE "video_summary" (
    "summaryid" SERIAL PRIMARY KEY,
    "videoid" INT NOT NULL,
    "summary" TEXT NOT NULL,
    FOREIGN KEY ("videoid") REFERENCES "video"("videoid") ON DELETE CASCADE
);

CREATE TABLE "language" (
    "languageid" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE "video_language" (
    "videoid" INT NOT NULL,
    "languageid" INT NOT NULL,
    PRIMARY KEY ("videoid", "languageid"),
    FOREIGN KEY ("videoid") REFERENCES "video"("videoid") ON DELETE CASCADE,
    FOREIGN KEY ("languageid") REFERENCES "language"("languageid")
);

-- MOCK DATA, will be changed to real data eventually --

INSERT INTO "user" ("email", "username", "password") VALUES 
('user1@gmail.com', 'user1', 'password1'),
('user2@gmail.com', 'user2', 'password2');

INSERT INTO "admin" ("email", "username", "password") VALUES
('admin@gmail.com', 'admin', 'admin1');

INSERT INTO "video" ("userid", "title", "filepath", "duration") VALUES
(1, 'Clap clap kids - LA VACA LOLA', 'frontend/assets/video/lavaca.mp4', '00:01:46'),
(2, 'Learn Italian with Luca!', 'frontend/assets/video/luca.mp4', '00:02:47'),
(1, '5 Amazing Facts About Vivaldi', 'frontend/assets/video/vivaldi.mp4', '00:06:32');

INSERT INTO "tag" ("name") VALUES 
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
('Electronic'), 
('Jazz'), 
('Synthwave'), 
('Rock'), 
('Classical'), 
('Live Performance'), 
('DJ Set'), 
('Guitar Solo'), 
('Piano');

INSERT INTO "video_tag" ("videoid", "tagid") VALUES
(1, 3), (1, 4), -- Clap Clap Kids (Music, Kids)
(2, 1), (2, 5), -- Pixar (Education, Learning)
(3, 1), (3, 2); -- Vivaldi (Education, Entertainment)

-- Insert mock data for video summaries
INSERT INTO "video_summary" ("videoid", "summary") VALUES
(1, 'A fun and energetic Spanish kids'' song with catchy beats and simple lyrics, perfect for young children to sing along to while learning new words in Spanish.'),
(2, 'An engaging and entertaining Italian language lesson featuring Luca, a Pixar-style character who helps viewers learn basic Italian phrases through a fun, animated adventure.'),
(3, 'Discover five fascinating facts about Antonio Vivaldi, the legendary composer, as we explore his life, music, and lasting influence on classical music.');
/*
(4, 'A beginner-friendly French lesson that teaches basic greetings and common phrases, designed for those starting to learn the language.'),
(5, 'The traditional Danish national anthem, "Der er et yndigt land," featuring a solemn and patriotic melody that has been a symbol of Denmark for centuries.'),
(6, 'A motivational audio story about the importance of resilience, perseverance, and learning from life''s challenges, narrated with an inspiring tone.'),
(7, 'A quirky and catchy pop track from Tommy Cash, blending rap, electronic beats, and unique soundscapes, with a humorous and offbeat vibe.'),
(8, 'A humorous and engaging exploration of the Indian English accent, featuring examples of unique phrases and pronunciations, making it a fun listen for language enthusiasts.'),
(9, 'A playful and upbeat instrumental song aimed at toddlers, with simple rhythms and sounds to help young children develop their sense of timing and rhythm.'),
(10, 'An engaging introduction to the life and works of Antonio Vivaldi, designed for children and young learners, with exciting facts and music samples.'),
(11, 'A kid-friendly lesson introducing basic music theory concepts, including rhythm, melody, and harmony, aimed at sparking interest in music education for young listeners.'),
(12, 'A retro-inspired electronic track featuring elements of 8-bit music, blended with modern beats and synths, evoking the feeling of a classic video game soundtrack.'),
(13, 'A catchy and vibrant track from Sw@da and Niczos, combining elements of Polish pop and electronic music, with an energetic and fun vibe, perfect for dancing.');
*/

INSERT INTO "language" ("name") VALUES 
('English'),
('French'),
('Spanish'),
('Danish'),
('Estonian'),
('Polish'),
('Italian'),
('Hindi');

INSERT INTO "video_language" ("videoid", "languageid") VALUES 
(1, 3),  -- Spanish (Clap Clap Kids)
(2, 7),  -- Italian (Pixar)
(3, 1);  -- English (Vivaldi Facts)
