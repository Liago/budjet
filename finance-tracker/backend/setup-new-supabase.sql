-- SQL per ricreare il database Bud-Jet su nuovo progetto Supabase

-- Crea tabella users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crea tabella categories  
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crea tabella transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crea utente di test con password hashata
-- Password: "Mandingo" -> hash bcrypt
INSERT INTO users (email, password, name) VALUES (
    'andrea.zampierolo@me.com',
    '$2b$10$rOOo2fZlz1U8tXaJH5Pm4O4LbEHgXvNKkJLXQtJxR1L1tNkYxCKKC',
    'Andrea Zampierolo'
) ON CONFLICT (email) DO NOTHING;

-- Verifica creazione utente
SELECT id, email, name, created_at FROM users WHERE email = 'andrea.zampierolo@me.com';
