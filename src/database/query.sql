
CREATE DATABASE archery;

USE archery;

CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL
);

-- DROP TABLE categories;

INSERT INTO categories(name) 
VALUES 
('Infantil'), -- 1
('Novato'), -- 2
('Sub14'), -- 3
('Sub16'), -- 4
('Sub18'), -- 5
('Amateur'), -- 6
('Abierto'); -- 7

SELECT * FROM categories;

CREATE TABLE IF NOT EXISTS subcategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL
);

INSERT INTO subcategories (name)
VALUES
    ('Compuesto'), -- 1  
    ('Recurvo'); -- 2
    
-- DROP TABLE subcategories;
SELECT * FROM subcategories;
    

SELECT * FROM subcategories;

CREATE TABLE IF NOT EXISTS participants(
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    lastname VARCHAR(25) NOT NULL,
	points INT NOT NULL CHECK (points >= 1),
    category_id INT NOT NULL,
    subcategory_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

-- DROP TABLE participants;

SELECT * FROM participants;


-- INSERTAR PARTICIPANTES
INSERT INTO participants (name, lastname, points, category_id, subcategory_id)
	VALUES('tercer', 'Participante', 65, 4, 1);

CREATE TABLE series (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    participant_id INT NOT NULL,
    series_number INT NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(id)
);

-- DROP TABLE series;

SELECT * FROM series;

-- INSERTAR PARTICIPANTES CON SUS SERIES
INSERT INTO series(participant_id, series_number)
	VALUES
		(3,1),
		(3,2);

CREATE TABLE arrows (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    series_id INT NOT NULL,
    arrow_number INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    FOREIGN KEY (series_id) REFERENCES series(id)
);

-- DROP TABLE arrows;

SELECT * FROM arrows;

-- INSERTAR PARTICIPANTES CON SUS VALORES DE FLECHAS
INSERT INTO arrows(series_id, arrow_number, points)
	VALUES
		(10,1,2),(10,2,3),(10,3,5),(10,4,8),(10,5,2),(10,6,4),        
        (11,1,4),(11,2,5),(11,3,6),(11,4,7),(11,5,8),(11,6,9);

-- Sacar los 3 primeros lugares
SELECT id, name, lastname, points
FROM participants
ORDER BY points DESC;


SELECT 
    p.name AS participant_name,
    p.lastname AS participant_lastname,
    c.name AS category_name,
    sc.name AS subcategory_name,
    s.series_number,
    a.arrow_number,
    a.points AS arrow_points
FROM 
    participants p
JOIN 
    categories c ON p.category_id = c.id
JOIN 
    subcategories sc ON p.subcategory_id = sc.id
JOIN 
    series s ON p.id = s.participant_id
JOIN 
    arrows a ON s.id = a.series_id
ORDER BY 
    p.id, s.series_number, a.arrow_number;


