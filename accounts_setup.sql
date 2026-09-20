-- ==============================================================================
-- COMPTES D'ACCÈS — liés à la table users via user_id
-- Mot de passe : haché bcrypt, JAMAIS lisible depuis l'application.
--   • L'administrateur définit le mot de passe de chaque personne (création, puis
--     « Réinitialiser » pour en définir un nouveau) ; il n'est jamais affiché ensuite.
--   • La connexion vérifie le mot de passe côté base (verify_login).
-- À exécuter dans le SQL Editor de Supabase. Sans danger si déjà exécuté :
-- les comptes et mots de passe existants sont conservés.
-- ==============================================================================

-- 1. Hachage bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Table accounts (uniquement ce qu'on ne trouve pas dans users)
CREATE TABLE IF NOT EXISTS accounts (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id       TEXT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  password_hash TEXT,                          -- mot de passe haché bcrypt (NULL = non défini)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts (user_id);

-- 3. Sécurité : plus aucun accès direct à la table depuis l'application
--    (le hash ne sort jamais ; tout passe par la vue et les fonctions ci-dessous)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_accounts" ON accounts;
REVOKE ALL ON accounts FROM anon, authenticated;
GRANT ALL ON accounts TO service_role;

-- 4. Vue SANS le hash : elle indique seulement si un mot de passe est défini
DROP FUNCTION IF EXISTS upsert_account(TEXT, TEXT);
DROP VIEW IF EXISTS accounts_view;
CREATE VIEW accounts_view AS
SELECT
  a.id,
  a.user_id,
  (a.password_hash IS NOT NULL) AS has_password,
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

-- 5. Créer l'accès d'une personne, ou définir un nouveau mot de passe (haché ici, jamais relu)
CREATE OR REPLACE FUNCTION upsert_account(
  p_user_id  TEXT,
  p_password TEXT DEFAULT NULL   -- mot de passe EN CLAIR : haché ici ; s'il est vide, l'ancien est conservé
)
RETURNS SETOF accounts_view
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF p_password IS NOT NULL AND p_password <> '' THEN
    v_hash := crypt(p_password, gen_salt('bf', 10));
  ELSE
    SELECT password_hash INTO v_hash FROM accounts WHERE user_id = p_user_id;
  END IF;

  INSERT INTO accounts (id, user_id, password_hash, updated_at)
  VALUES ('acc-' || p_user_id, p_user_id, v_hash, now())
  ON CONFLICT (user_id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at    = now();

  RETURN QUERY SELECT * FROM accounts_view WHERE user_id = p_user_id;
END;
$$;

-- 6. Supprimer un accès
CREATE OR REPLACE FUNCTION delete_account(p_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  DELETE FROM accounts WHERE user_id = p_user_id;
END;
$$;

-- 7. Connexion : vérifie le mot de passe côté base (le hash n'est jamais renvoyé)
--    r_status : 'ok' | 'no_account' | 'no_password' | 'bad_password'
CREATE OR REPLACE FUNCTION verify_login(p_email TEXT, p_password TEXT)
RETURNS TABLE (r_status TEXT, r_user_id TEXT, r_full_name TEXT, r_email TEXT, r_poste TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid   TEXT;
  v_hash  TEXT;
  v_name  TEXT;
  v_mail  TEXT;
  v_poste TEXT;
BEGIN
  SELECT a.user_id, a.password_hash,
         trim(coalesce(u.prenom, '') || ' ' || coalesce(u.nom, '')),
         u.email, u.poste
    INTO v_uid, v_hash, v_name, v_mail, v_poste
    FROM accounts a
    JOIN users u ON u.user_id = a.user_id
   WHERE lower(u.email) = lower(trim(p_email))
   LIMIT 1;

  IF v_uid IS NULL THEN
    RETURN QUERY SELECT 'no_account'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
  ELSIF v_hash IS NULL THEN
    RETURN QUERY SELECT 'no_password'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
  ELSIF crypt(coalesce(p_password, ''), v_hash) = v_hash THEN
    RETURN QUERY SELECT 'ok'::TEXT, v_uid, v_name, v_mail, v_poste;
  ELSE
    RETURN QUERY SELECT 'bad_password'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_account(TEXT, TEXT)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_account(TEXT)              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_login(TEXT, TEXT)          TO anon, authenticated;

-- 8. Recharger le cache de l'API
NOTIFY pgrst, 'reload schema';
