CREATE DATABASE bistro;
\c bistro

CREATE TYPE difficulty_level AS ENUM ('Facile', 'Moyen', 'Difficile', 'Extreme');
CREATE TYPE challenge_category AS ENUM ('Culture', 'Maths', 'Logique', 'Autre');

CREATE TABLE users (
    discord_id VARCHAR(20) PRIMARY KEY,
    last_annoy BIGINT,
    last_annoyed BIGINT,
    total_point INT
);

CREATE TABLE challenge (
    challenge_id SERIAL PRIMARY KEY,
    challenge_name VARCHAR(32),
    contexte TEXT,
    point_obtainable INT,
    difficulty difficulty_level,
    category challenge_category,
    answer VARCHAR(32),
    input TEXT
);

CREATE TABLE user_challenge (
    discord_id VARCHAR(20) NOT NULL,
    challenge_id SERIAL NOT NULL,
    date_completed BIGINT,
    PRIMARY KEY (discord_id, challenge_id),
    FOREIGN KEY (discord_id) REFERENCES users(discord_id),
    FOREIGN KEY (challenge_id) REFERENCES Challenge(challenge_id)
);

