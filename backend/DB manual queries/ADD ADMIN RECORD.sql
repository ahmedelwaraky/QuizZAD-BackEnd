-- Active: 1697696030882@@127.0.0.1@3306@quizzad


-- Insert an admin user as a Admin
INSERT INTO User (email, password, firstName, lastName, role)
VALUES ('admin@example.com', 'hashed_password', 'Mo', 'Basyoni', 'ADMIN');


-- Retrieve the id of the newly inserted admin 
SELECT id FROM User WHERE email = 'peterbahgat1@gmail.com';

-- Insert a corresponding record into the Admin table
INSERT INTO Admin (profileId) VALUES (1);

INSERT INTO Teacher (profileId) VALUES (3);
