-- ==============================================================================
-- TABLE ACCOUNTS — liée à la table users via user_id
-- Seul le mot de passe est stocké ici — tout le reste vient de users
-- À exécuter dans le SQL Editor de votre Dashboard Supabase
-- ==============================================================================

-- 1. Activer pgcrypto pour le hachage bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Créer la table accounts (légère — uniquement ce qu'on ne trouve pas dans users)
CREATE TABLE IF NOT EXISTS accounts (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id       TEXT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  password_hash TEXT,                          -- mot de passe haché bcrypt
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts (user_id);

-- 3. RLS permissif
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_accounts" ON accounts;
CREATE POLICY "allow_all_accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON accounts TO anon, authenticated, service_role;

-- 4. Vue qui joint accounts + users pour lire toutes les infos en une requête
CREATE OR REPLACE VIEW accounts_view AS
SELECT
  a.id,
  a.user_id,
  a.password_hash,
  a.created_at,
  a.updated_at,
  u.username,
  u.nom         AS last_name,
  u.prenom      AS first_name,
  u.email,
  u.entreprise  AS company,
  u.site,
  u.departement AS department,
  u.poste,
  u.statut      AS status
FROM accounts a
JOIN users u ON u.user_id = a.user_id;

GRANT SELECT ON accounts_view TO anon, authenticated, service_role;

-- 5. Fonction RPC upsert_account
--    Reçoit user_id + mot de passe EN CLAIR → hache et insère/met à jour
CREATE OR REPLACE FUNCTION upsert_account(
  p_user_id  TEXT,
  p_password TEXT   -- mot de passe EN CLAIR — sera haché ici
)
RETURNS SETOF accounts_view
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash TEXT;
  v_id   TEXT;
BEGIN
  -- Hacher le mot de passe si fourni, sinon garder l'ancien hash
  IF p_password IS NOT NULL AND p_password <> '' THEN
    v_hash := crypt(p_password, gen_salt('bf', 10));
  ELSE
    SELECT password_hash INTO v_hash FROM accounts WHERE user_id = p_user_id;
  END IF;

  -- Générer un id stable basé sur user_id (idempotent)
  v_id := 'acc-' || p_user_id;

  INSERT INTO accounts (id, user_id, password_hash, updated_at)
  VALUES (v_id, p_user_id, v_hash, now())
  ON CONFLICT (user_id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at    = now();

  RETURN QUERY SELECT * FROM accounts_view WHERE user_id = p_user_id;
END;
$$;

-- 6. Fonction RPC delete_account
CREATE OR REPLACE FUNCTION delete_account(p_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM accounts WHERE user_id = p_user_id;
END;
$$;

-- 7. Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';
