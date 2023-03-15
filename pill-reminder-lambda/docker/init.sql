CREATE ROLE y0ri LOGIN password 'XvvnYrUd5b20';
CREATE DATABASE pill_reminder ENCODING 'UTF8' OWNER y0ri;

CREATE TABLE users (
    email VARCHAR(64) NOT NULL,
    password VARCHAR(64) NOT NULL,
    name VARCHAR(32) NOT NULL,
    PRIMARY KEY (email)
);

CREATE TABLE schedules (
    id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64),
    pill_name VARCHAR(64) NOT NULL,
    dosage INTEGER,
    -- frequency INTEGER NOT NULL,
    start_date DATE,
    time TIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(email)
);