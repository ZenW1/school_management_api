INSERT INTO "user" (name, email, dob) VALUES
('Alice Smith', 'alice@example.com', '1990-01-01 00:00:00'),
('Bob Jones', 'bob@example.com', '1992-02-15 00:00:00'),
('Charlie Brown', 'charlie@example.com', '1985-06-20 00:00:00'),
('Diana Prince', 'diana@example.com', '1995-11-05 00:00:00'),
('Evan Wright', 'evan@example.com', '1988-03-30 00:00:00'),
('Fiona Gallagher', 'fiona@example.com', '1993-08-12 00:00:00'),
('George Miller', 'george@example.com', '1982-12-25 00:00:00'),
('Hannah Abbott', 'hannah@example.com', '1997-04-18 00:00:00'),
('Ian Malcolm', 'ian@example.com', '1979-09-09 00:00:00'),
('Julia Child', 'julia@example.com', '1984-07-04 00:00:00')
ON CONFLICT (email) DO NOTHING;
