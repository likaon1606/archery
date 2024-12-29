
CREATE DATABASE archery;

USE archery;

CREATE TABLE IF NOT EXISTS participants(
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    lastname VARCHAR(25) NOT NULL,
    round INT NOT NULL CHECK (round >= 1),
	points INT NOT NULL CHECK (points >= 1)
);

SELECT * FROM participants;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    role ENUM('admin', 'normal') NOT NULL,
    password VARCHAR(255) NOT NULL
);


SELECT * FROM users;

-- Sacar los 3 primeros lugares
SELECT id, name, lastname, points
FROM participants
ORDER BY points DESC;

