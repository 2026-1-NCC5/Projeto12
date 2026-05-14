-- Schema do Banco de Dados MegaVision (Supabase)

-- Tabela de Equipes
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Tabela de Doações / Coletas
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    item_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    weight_kg NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Segurança (RLS)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON donations FOR SELECT USING (true);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on teams" ON teams FOR SELECT USING (true);
