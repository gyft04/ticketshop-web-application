-- ============================================================
-- SEED DATA — for development and testing only
-- Run this AFTER schema.sql
-- ============================================================

-- Admin user (password is just a placeholder — hashing comes later with bcrypt)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@ticketshop.de', 'placeholder_hash', 'admin');

-- Organizer user
INSERT INTO users (name, email, password, role) VALUES
('Atelier Theater', 'kontakt@atelier-theater.de', 'placeholder_hash', 'organizer');

-- organizer_id = 2 (Atelier Theater)

-- ============================================================
-- EVENTS
-- ============================================================

INSERT INTO events (title, description, start_date, end_date, start_time, end_time, location, category, image, status, organizer_id) VALUES
(
    'Bademeister Schaluppke',
    'Das Erfolgs-Soloprogramm "SPASSbad" von Bademeister Schaluppke — Kult-Comedy aus Köln.',
    '2025-08-21', '2025-08-21', '20:00:00', '22:00:00',
    'Atelier Theater, Roonstr. 78, Köln',
    'Comedy & Cabaret',
    'bademeister-schaluppke.jpg',
    'published',
    2
),
(
    'Martin Zingsheim',
    'Martin Zingsheim präsentiert sein neues Programm "normal ist das nicht" — Kabarett auf höchstem Niveau.',
    '2025-08-28', '2025-08-28', '20:00:00', '22:00:00',
    'Atelier Theater, Roonstr. 78, Köln',
    'Comedy & Cabaret',
    'martin-zingsheim.jpg',
    'published',
    2
),
(
    'Didi Jünemann',
    '"Wir Kellerkinder" — zum 100. Geburtstag von Wolfgang Neuss. Ein bewegendes Theaterstück.',
    '2025-10-05', '2025-10-05', '18:00:00', '20:00:00',
    'Atelier Theater, Roonstr. 78, Köln',
    'Theater',
    'didi-juenemann.jpg',
    'published',
    2
),
(
    'David Kebekus +1',
    'David Kebekus mit Lena Kupke — "Comedy-Kooperation vom Feinsten". Zwei Comedians, eine Bühne.',
    '2025-09-03', '2025-09-03', '20:00:00', '22:00:00',
    'Atelier Theater, Roonstr. 78, Köln',
    'Comedy & Cabaret',
    'david-kebekus.jpg',
    'published',
    2
),
(
    'Wohl bekloppt geworden',
    'Die Comedy Mix Show im Atelier Theater — verschiedene Comedians, ein Abend voller Lachen.',
    '2025-09-05', '2025-09-05', '20:00:00', '22:00:00',
    'Atelier Theater, Roonstr. 78, Köln',
    'Comedy & Cabaret',
    'comedy-mix.jpg',
    'published',
    2
);

-- ============================================================
-- TICKET CATEGORIES
-- event_id 1 = Bademeister Schaluppke
-- event_id 2 = Martin Zingsheim
-- event_id 3 = Didi Jünemann
-- event_id 4 = David Kebekus
-- event_id 5 = Wohl bekloppt geworden
-- ============================================================

INSERT INTO ticket_categories (name, event_id, price, quantity_available, quantity_sold) VALUES
('Standard',    1, 17.00, 80,  12),
('VIP',         1, 22.00, 20,   5),

('Standard',    2, 20.00, 80,  30),
('VIP',         2, 25.00, 20,   8),

('Standard',    3, 17.00, 60,   0),
('Discounted',  3, 13.00, 20,   0),

('Standard',    4, 17.00, 80,  45),
('VIP',         4, 22.00, 20,  20),

('Standard',    5, 17.00, 100, 60),
('VIP',         5, 22.00, 25,  10);
