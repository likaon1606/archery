
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

