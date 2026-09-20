-- ==============================================================================
-- LEBRUN S.A., AUTOBIZ, CARIBE MOTORS & LEADER FOODS
-- CONFIGURATION DES POLITIQUES RLS SUPABASE & INGESTION DES DONNÉES
-- À exécuter dans l'éditeur SQL (SQL Editor) de votre Dashboard Supabase
-- ==============================================================================

-- 1. AUTORISATION ET PRIVILÈGES POUR LE RÔLE PUBLIC / ANON
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 2. DÉSACTIVATION RLS OU POLITIQUES RLS PERMISSIVES SUR TOUTES LES TABLES

-- Table USERS
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_users" ON users;
CREATE POLICY "allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Table IT_EQUIPMENT
ALTER TABLE IF EXISTS it_equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_it" ON it_equipment;
CREATE POLICY "allow_all_it" ON it_equipment FOR ALL USING (true) WITH CHECK (true);

-- Table PRINTERS
ALTER TABLE IF EXISTS printers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_printers" ON printers;
CREATE POLICY "allow_all_printers" ON printers FOR ALL USING (true) WITH CHECK (true);

-- Table NETWORK_EQUIPMENT
ALTER TABLE IF EXISTS network_equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_network" ON network_equipment;
CREATE POLICY "allow_all_network" ON network_equipment FOR ALL USING (true) WITH CHECK (true);

-- Table UPS
ALTER TABLE IF EXISTS ups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_ups" ON ups;
CREATE POLICY "allow_all_ups" ON ups FOR ALL USING (true) WITH CHECK (true);

-- Table USER_APPLICATIONS
ALTER TABLE IF EXISTS user_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_apps" ON user_applications;
CREATE POLICY "allow_all_apps" ON user_applications FOR ALL USING (true) WITH CHECK (true);

-- Table WIFI_NETWORKS
ALTER TABLE IF EXISTS wifi_networks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_wifi" ON wifi_networks;
CREATE POLICY "allow_all_wifi" ON wifi_networks FOR ALL USING (true) WITH CHECK (true);

-- Table DOCUMENTS
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_docs" ON documents;
CREATE POLICY "allow_all_docs" ON documents FOR ALL USING (true) WITH CHECK (true);

-- 3. STRUCTURE DES TABLES (S'assurer que les colonnes existent)
ALTER TABLE users ADD COLUMN IF NOT EXISTS departement TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS poste TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telephone TEXT;

-- S'assurer que la contrainte UNIQUE existe sur username
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

-- 4. INSERTION ET MISE À JOUR DE TOUS LES COLLABORATEURS DANS SUPABASE
INSERT INTO users (user_id, username, email, nom, prenom, entreprise, site, departement, poste, statut)
VALUES
('EMP-LEB-001', 'rmdguerrier', 'rmdguerrier@lebrunsa.com', 'Guerrier', 'Roody-Max-Dominique', 'Lebrun S.A.', 'Delmas 52', 'Direction IT & Cloud', 'Directeur des Systèmes d''Information', 'Actif'),
('EMP-AUT-002', 'autobiz1', 'dorcius@autobizsa.com', 'Dorcius', 'Alexis', 'Autobiz', 'Delmas 52', 'Opérations Commerciales', 'Responsable Ventes Autobiz', 'Actif'),
('EMP-AUT-003', 'absa', 'recouvrement@autobizsa.com', 'Herdritch', 'Morisset', 'Autobiz', 'Delmas 52', 'Comptabilité & Finances', 'Responsable Recouvrement', 'Actif'),
('EMP-LEB-004', 'mjcolin', 'sales@lebrunsa.com', 'Julien', 'Masha-Lyodine', 'Lebrun S.A.', 'Delmas 52', 'Comptabilité & Finances', 'Comptable', 'Actif'),
('EMP-LEB-005', 'etoussaint', 'etoussaint@lebrunsa.com', 'Toussaint', 'Ernst', 'Lebrun S.A.', 'Delmas 52', 'Direction Générale', 'Directeur Administratif', 'Actif'),
('EMP-LEB-006', 'blynn', 'administation@lebrunsa.com', 'Renica', 'Etienne', 'Lebrun S.A.', 'Delmas 52', 'Ressources Humaines', 'Responsable RH', 'Actif'),
('EMP-LEB-007', 'dflorestant', 'dflorestant@lebrunsa.com', 'Florestant', 'Lynn A.D.', 'Lebrun S.A.', 'Delmas 52', 'Comptabilité & Finances', 'Responsable Comptable', 'Actif'),
('EMP-LEB-008', 'jbangello', 'jbangelo@lebrunsa.com', 'Jean Baptiste', 'Angello', 'Lebrun S.A.', 'Delmas 52', 'Logistique & Entrepôt', 'Gestionnaire de Stocks', 'Actif'),
('EMP-LEB-009', 'slouisjean', 'slouisjean@lebrunsa.com', 'Louis jean', 'Stephane', 'Lebrun S.A.', 'Delmas 52', 'Logistique & Entrepôt', 'Chef d''Entrepôt', 'Actif'),
('EMP-AUT-010', 'Jlaura', 'laurajeune@autobizsa.com', 'Jeune', 'Laura', 'Autobiz', 'Delmas 52', 'Opérations Commerciales', 'Service Clientèle Autobiz', 'Actif'),
('EMP-AUT-011', 'fbellevu', 'fbellevu@autobizsa.com', 'Bellevu', 'Frantz', 'Autobiz', 'Delmas 52', 'Opérations Commerciales', 'Support & Opérations Autobiz', 'Actif'),
('EMP-LEB-012', 'gjeanbaptiste', 'gjeanbaptiste@lebrunsa.com', 'Jean Baptiste', 'Gabner', 'Lebrun S.A.', 'Delmas 52', 'Logistique & Entrepôt', 'Technicien Logistique', 'Actif'),
('EMP-LEB-013', 'jstheodore', 'jstheodore@autobizsa.com', 'Theodore', 'Jean Sebastien', 'Lebrun S.A.', 'Delmas 52', 'Comptabilité & Finances', 'Facturation & Ventes', 'Actif'),
('EMP-LEB-014', 'keugene', 'keugene@lebrunsa.com', 'Eugene', 'Kensly', 'Lebrun S.A.', 'Delmas 52', 'Direction IT & Cloud', 'Administrateur Systèmes & Réseaux', 'Actif'),
('EMP-LEB-015', 'samerger', 'samerger@lebrunsa.com', 'Merger', 'Serge André', 'Lebrun S.A.', 'Delmas 52', 'Direction Générale', 'Directeur Général', 'Actif'),
('EMP-AUT-016', 'sstvictor', 's.stvictor@autobizsa.com', 'St Victor', 'Serge', 'Autobiz', 'Delmas 52', 'Direction Générale', 'Directeur Opérations Autobiz', 'Actif'),
('EMP-LEB-619', 'vanessamaxime', 'vanessamaxime@caribe-motors.com', 'Maxime', 'Vanessa', 'Caribe Motors', 'Pétion-Ville', 'Ventes & Commercial', 'Service Adviser', 'Actif'),
('EMP-LEB-631', 'leongueschon', 'leon.gueschon@caribe-motors.com', 'Gueschon', 'Leon', 'Caribe Motors', 'Pétion-Ville', 'Logistique & Stocks', 'Directeur Departement pieces', 'Actif'),
('EMP-LEB-699', 'scadet', 'scadet@caribe-motors.com', 'Cadet', 'Sebastien', 'Caribe Motors', 'Pétion-Ville', 'Ventes & Commercial', 'Service Advisor', 'Actif'),
('EMP-LEB-224', 'mgelin', 'mgelin@caribe-motors.com', 'Lamarre', 'Marjorie', 'Caribe Motors', 'Pétion-Ville', 'Ventes & Commercial', 'Assistante Vente', 'Actif'),
('EMP-LEB-758', 'oboisson', 'oboisson@caribe-motors.com', 'Boisson', 'Olivier', 'Caribe Motors', 'Pétion-Ville', 'Logistique & Stocks', 'Assistant Parts', 'Actif'),
('EMP-LEB-729', 'Vraymond', 'Vraymond@caribe-motors.com', 'Raymond Vamir', 'Nycole', 'Caribe Motors', 'Pétion-Ville', 'Ventes & Commercial', 'Service Advisor', 'Actif'),
('EMP-LEB-445', 'phjbastien', 'phjbastien@caribe-motors.com', 'Paul-Henry', 'Jacques', 'Caribe Motors', 'Pétion-Ville', 'Ventes & Commercial', 'Responsable de Ventes', 'Actif'),
('EMP-LEB-751', 'chjoseph', 'chjoseph@caribe-motors.com', 'Joseph', 'Carl-Hens', 'Caribe Motors', 'Pétion-Ville', 'Administration & Direction', 'Assistant administrative', 'Actif'),
('EMP-LEB-941', 'ops', 'accounting@caribe-motors.com', 'Marie Richenaderline', 'Lafleur', 'Caribe Motors', 'Pétion-Ville', 'Recouvrement & Finances', 'Assistant Comptable', 'Actif')
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  nom = EXCLUDED.nom,
  prenom = EXCLUDED.prenom,
  email = EXCLUDED.email,
  entreprise = EXCLUDED.entreprise,
  site = EXCLUDED.site,
  departement = EXCLUDED.departement,
  poste = EXCLUDED.poste,
  statut = EXCLUDED.statut;

-- ==============================================================================
-- 4. TÉLÉPHONES / PORTABLES  (page « Téléphones » de l'application)
-- À exécuter une fois dans le SQL Editor de Supabase. Sans danger si déjà exécuté.
-- Marque + modèle obligatoires ; IMEI 1 et IMEI 2 facultatifs.
-- user_id = matricule du collaborateur (sans clé étrangère : la suppression d'un
-- collaborateur ne bloque jamais et le téléphone reste dans l'inventaire).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS phones (
  id           BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  phone_id     TEXT NOT NULL UNIQUE,          -- code du téléphone (ex: TEL-LEB-001)
  entreprise   TEXT,
  site         TEXT,
  marque       TEXT NOT NULL,
  modele       TEXT NOT NULL,
  imei1        TEXT,
  imei2        TEXT,
  user_id      TEXT,                          -- matricule de la personne associée
  personne     TEXT,                          -- nom complet de la personne associée
  observations TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS phones_user_id_idx ON phones (user_id);

ALTER TABLE phones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_phones" ON phones;
CREATE POLICY "allow_all_phones" ON phones FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON phones TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Recharge le cache de l'API pour que la table soit visible immédiatement
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- 5. TABLE DOCUMENTS : colonnes supplémentaires (site, type de fichier, taille, date)
-- À exécuter une fois dans le SQL Editor de Supabase. Sans danger si déjà exécuté.
-- ==============================================================================
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS site         TEXT,
  ADD COLUMN IF NOT EXISTS file_type    TEXT DEFAULT 'pdf',
  ADD COLUMN IF NOT EXISTS file_size    TEXT,
  ADD COLUMN IF NOT EXISTS last_updated DATE;

-- Complète les documents déjà enregistrés
UPDATE documents SET file_type = 'pdf' WHERE file_type IS NULL;
UPDATE documents SET last_updated = created_at::date WHERE last_updated IS NULL;

NOTIFY pgrst, 'reload schema';
