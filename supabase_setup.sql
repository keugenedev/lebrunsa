-- ==============================================================================
-- LEBRUN S.A. & AUTOBIZ - CONFIGURATION & SYNCHRONISATION SUPABASE COMPLÈTE
-- À exécuter dans l'éditeur SQL de votre Dashboard Supabase (SQL Editor)
-- ==============================================================================

-- 1. CRÉATION DES TABLES AVEC RLS DÉSACTIVÉ POUR L'ACCÈS PUBLIC DIRECT
CREATE TABLE IF NOT EXISTS printers (
  printer_id SERIAL PRIMARY KEY,
  entreprise TEXT,
  site TEXT,
  nom_imprimante TEXT,
  marque TEXT,
  modele TEXT,
  numero_serie TEXT UNIQUE,
  adresse_ip TEXT,
  type TEXT,
  etat TEXT DEFAULT 'Fonctionnel',
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS printers DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  nom TEXT,
  prenom TEXT,
  entreprise TEXT,
  site TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS network_equipment (
  id SERIAL PRIMARY KEY,
  entreprise TEXT,
  site TEXT,
  type_equipement TEXT,
  marque TEXT,
  modele TEXT,
  hostname TEXT,
  numero_serie TEXT,
  adresse_ip TEXT,
  adresse_mac TEXT,
  etat TEXT DEFAULT 'En fonctionnement',
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS network_equipment DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS ups_equipment (
  id SERIAL PRIMARY KEY,
  entreprise TEXT,
  site TEXT,
  nom TEXT,
  marque TEXT,
  modele TEXT,
  capacite TEXT,
  reference TEXT,
  etat TEXT DEFAULT 'En fonctionnement',
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS ups_equipment DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS application_accounts (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE,
  nom TEXT,
  prenom TEXT,
  password TEXT,
  applications TEXT,
  organisation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS application_accounts DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS it_assets (
  id SERIAL PRIMARY KEY,
  asset_tag TEXT UNIQUE,
  nom TEXT,
  marque TEXT,
  modele TEXT,
  numero_serie TEXT UNIQUE,
  cpu TEXT,
  ram TEXT,
  stockage TEXT,
  assigne_a TEXT,
  departement TEXT,
  site TEXT,
  statut TEXT DEFAULT 'in_use',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS it_assets DISABLE ROW LEVEL SECURITY;

-- 2. INSERTION DES 17 IMPRIMANTES HP OFFICIELLES
INSERT INTO printers (entreprise, site, nom_imprimante, marque, modele, numero_serie, adresse_ip, type, etat, observations)
VALUES
('Lebrun S.A.', 'Delmas 52', 'Hp Laser jet pro', 'Hp', '4103dw', 'THBTT5R0', '192.168.1.175', 'Multifonction', 'Fonctionnel', 'Good'),
('Autobiz', 'Delmas 52', 'Hp Laser jet pro', 'Hp', 'M201dw', 'VNB3F36006', 'N/A', 'Laser', 'Fonctionnel', 'Good'),
('Autobiz', 'Delmas 52', 'Hp Laser jet MFP M140W (Hp Autobiz)', 'Hp', 'Hp Laser jet MFP M139-M142', 'VND4640613', '192.168.1.121', 'Multifonction', 'Fonctionnel', 'Good'),
('Autobiz', 'Delmas 52', 'Hp Cheque Imspression', 'Hp', 'Hp Laser jet Pro P1606dn', 'VNB3N72975', '192.168.0.27', 'Laser', 'Fonctionnel', 'Good'),
('Lebrun S.A.', 'Delmas 52', 'Hp Ernst', 'Hp', 'Hp Color Laser Jet pro MFP M479dw', 'CNCRQ6D5NG', '192.168.1.223', 'Multifonction', 'Fonctionnel', 'Good'),
('Lebrun S.A.', 'Delmas 52', 'Hp M1132', 'Hp', 'Hp LaserJet Professional M1132 MFP', 'CNG9CCYPTZ', 'N/A', 'Laser', 'Fonctionnel', 'Good'),
('Lebrun S.A.', 'Delmas 52', 'Hp Laser Jet Pro', 'Hp', 'M428fdw', 'CNDRQ307CT', '192.168.1.150', 'Multifonction', 'Fonctionnel', 'Good'),
('Lebrun S.A.', 'Delmas 52', 'Hp Laser Jet Pro', 'Hp', 'Hp Laser jet pro MFP M127fw', 'CNB8HDT034', '192.168.1.57', 'Laser', 'Fonctionnel', 'Good'),
('Lebrun S.A.', 'Delmas 52', 'Hp Laser Jet Pro', 'Hp', 'Hp Laser jet pro M201dw', 'VNB3H05692', '192.168.1.8', 'Laser', 'Fonctionnel', 'Good'),
('Autobiz', 'Delmas 52', 'Hp Color Laser Jet Pro', 'Hp', 'MFP M479fdn', 'MXBCN7510N', '192.168.1.184', 'Multifonction', 'Fonctionnel', 'Good'),
('Lebrun S.A.', 'Delmas 52', 'Hp Color Laser Jet Pro', 'Hp', 'MFP4 301', 'THBGTBW0BR', '192.168.223.1', 'Multifonction', 'Fonctionnel', 'Good'),
('Caribe Motors', 'Delmas 52', 'Hp Color Laser Jet Pro', 'Hp', 'MFP4 301', 'THBGV3212V', '192.168.1.68', 'Multifonction', 'Fonctionnel', 'Good'),
('Lebrun S.A.', 'Delmas 52', 'Hp Color Laser Jet Pro', 'Hp', 'MFP4 301', 'THBGT8K0MG', '192.168.1.127', 'Multifonction', 'Fonctionnel', 'Good'),
('Leader Foods', 'Aéroport Depot', 'Color Laser Jet Pro', 'Hp', 'M454dn', 'VNBS3S11407', '192.168.1.80', 'Multifonction', 'Fonctionnel', 'Good'),
('Leader Foods', 'Aéroport Depot', 'Hp Laser Jet Pro', 'Hp', 'M404DN', 'PHDBB40710', '192.168.1.90', 'Laser (Cheque)', 'Fonctionnel', 'Good'),
('Leader Foods', 'Aéroport Depot', 'Hp Laser Jet Pro', 'Hp', 'MFPM127/M128', 'VNG3J17256', '196.254.224.224', 'Multifonction', 'Fonctionnel', 'Good'),
('Lebrun S.A.', 'Delmas 52', 'Hp Laser Jet Pro', 'Hp', 'M428fdw', 'CNDRQ2B61Y', '192.168.1.172', 'Multifonction', 'Fonctionnel', 'Good')
ON CONFLICT (numero_serie) DO UPDATE SET
  entreprise = EXCLUDED.entreprise,
  site = EXCLUDED.site,
  nom_imprimante = EXCLUDED.nom_imprimante,
  modele = EXCLUDED.modele,
  adresse_ip = EXCLUDED.adresse_ip,
  type = EXCLUDED.type,
  etat = EXCLUDED.etat,
  observations = EXCLUDED.observations;

-- 3. INSERTION DES 5 ÉQUIPEMENTS RÉSEAU TP-LINK
INSERT INTO network_equipment (entreprise, site, type_equipement, marque, modele, hostname, numero_serie, adresse_ip, adresse_mac, etat, observations)
VALUES
('Lebrun S.A.', 'Delmas 52', 'Switch Gigabit rackable', 'TP-Link', 'TL-SG1218MP', 'Switch-Rack-18P', 'TL-SG1218MP-SN01', 'À compléter', 'À compléter', 'En fonctionnement', '18 ports Gigabit, dont 16 ports PoE+'),
('Lebrun S.A.', 'Delmas 52', 'Switch Ethernet', 'TP-Link', 'TL-SF1005P (UN)', 'Switch-5P-PoE', 'Y24A0S3001174', 'À compléter', 'À compléter', 'En fonctionnement', '5 ports 10/100 Mbps, 4 ports PoE+, alimentation 53,5 V / 1,31 A, version 5.6'),
('Lebrun S.A.', 'Delmas 52', 'Point d'accès / équipement Wi‑Fi', 'TP-Link', 'TP-Link Wi-Fi AP 1', 'AP-WIFI-01', 'TPL-AP-001', 'À compléter', 'À compléter', 'En fonctionnement', 'Équipement TP-Link avec connexion réseau Ethernet visible'),
('Lebrun S.A.', 'Delmas 52', 'Point d'accès / équipement Wi‑Fi', 'TP-Link', 'TP-Link Wi-Fi AP 2', 'AP-WIFI-02', 'TPL-AP-002', 'À compléter', 'À compléter', 'En fonctionnement', 'Équipement TP-Link avec connexion réseau Ethernet visible'),
('Lebrun S.A.', 'Delmas 52', 'Point d'accès / équipement Wi‑Fi', 'TP-Link', 'TP-Link Wi-Fi AP 3', 'AP-WIFI-03', 'TPL-AP-003', 'À compléter', 'À compléter', 'En fonctionnement', 'Équipement TP-Link avec connexion réseau Ethernet visible');

-- 4. INSERTION DES 7 ONDULEURS & UPS (FORZA & APC)
INSERT INTO ups_equipment (entreprise, site, nom, marque, modele, capacite, reference, etat, observations)
VALUES
('Lebrun S.A.', 'Delmas 52', 'UPS 1', 'Forza', 'NT-1011D', '1000 VA / 500 W', 'NT-1011D', 'En fonctionnement', 'Entrée 110–120 Vac, sortie 110–120 Vac'),
('Autobiz', 'Delmas 52', 'UPS 2', 'Forza', 'NT-1011D', '1000 VA / 500 W', 'NT-1011D', 'En fonctionnement', 'Entrée 110–120 Vac, sortie 110–120 Vac'),
('Lebrun S.A.', 'Delmas 52', 'UPS 3', 'APC', 'Back-UPS 1000', '1000 VA', 'Back-UPS 1000', 'En fonctionnement', 'Écran indiquant ON LINE et entrée 115 V'),
('Lebrun S.A.', 'Delmas 52', 'UPS 4', 'Forza', 'NT-751D', '750 VA / 375 W', 'NT-751D', 'En fonctionnement', 'Entrée 110–120 Vac, sortie 110–120 Vac'),
('Autobiz', 'Delmas 52', 'UPS 5', 'Forza', 'NT-1011D', '1000 VA / 500 W', 'NT-1011D', 'En fonctionnement', 'Entrée 110–120 Vac, sortie 110–120 Vac'),
('Lebrun S.A.', 'À confirmer', 'UPS 6', 'Forza', 'NT-1011D', '1000 VA / 500 W', 'NT-1011D', 'En fonctionnement', 'Étiquette visible : entrée 110–120 Vac, sortie 110–120 Vac. N° de série non conservé.'),
('Autobiz', 'À confirmer', 'UPS 7', 'APC', 'À compléter', 'À compléter', 'APC', 'En fonctionnement', 'Modèle et capacité non lisibles sur la photo. N° de série non conservé.');

-- 5. INSERTION DES 13 COMPTES ET MOTS DE PASSE MICROSOFT GP
INSERT INTO application_accounts (username, nom, prenom, password, applications, organisation)
VALUES
('rmdguerrier', 'Guerrier', 'Roody-Max-Dominique', '123456', 'Microsoft GP', 'Lebrun s.a | Autobiz S.A'),
('autobiz1', 'Dorcius', 'Alexis', '1234', 'Microsoft GP', 'Autobiz S.A'),
('absa', 'Herdritch', 'Morisset', '1234', 'Microsoft GP', 'Autobiz S.A'),
('mjcolin', 'Julien', 'Masha-Lyodine', '1234', 'Microsoft GP', 'Lebrun s.a'),
('etoussaint', 'Toussaint', 'Ernst', 'ET@1234', 'Microsoft GP', 'Lebrun s.a'),
('blynn', 'Renica', 'Etienne', '1234', 'Microsoft GP', 'Lebrun S.A'),
('dflorestant', 'Florestant', 'Lynn A.D.', 'lsa12345', 'Microsoft GP', 'Lebrun S.a'),
('jbangello', 'Jean Baptiste', 'Angello', '1234', 'Microsoft GP', 'Lebrun S.a'),
('slouisjean', 'Louis jean', 'Stephane', 'N/A', 'Microsoft GP', 'Lebrun S.a'),
('Jlaura', 'Jeune', 'Laura', 'e0398', 'Microsoft GP', 'Autobiz S.A'),
('fbellevu', 'Bellevu', 'Frantz', '4299', 'Microsoft GP', 'Autobiz S.A'),
('jstheodore', 'Theodore', 'Jean Sebastien', '1234', 'Microsoft GP', 'Lebrun S.a'),
('sstvictor', 'St Victor', 'Serge', '7070', 'Microsoft GP', 'Autobiz S.A')
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  applications = EXCLUDED.applications,
  organisation = EXCLUDED.organisation;

-- 6. INSERTION DES 16 VRAIS COLLABORATEURS DU GROUPE LEBRUN S.A.
INSERT INTO users (username, email, nom, prenom, entreprise, site)
VALUES
('rmdguerrier', 'rmdguerrier@lebrunsa.com', 'Guerrier', 'Roody-Max-Dominique', 'Lebrun S.A.', 'Delmas 52'),
('autobiz1', 'dorcius@autobizsa.com', 'Dorcius', 'Alexis', 'Autobiz', 'Delmas 52'),
('absa', 'recouvrement@autobizsa.com', 'Herdritch', 'Morisset', 'Autobiz', 'Delmas 52'),
('mjcolin', 'sales@lebrunsa.com', 'Masha-Lyodine', 'Julien', 'Lebrun S.A.', 'Delmas 52'),
('etoussaint', 'etoussaint@lebrunsa.com', 'Toussaint', 'Ernst', 'Lebrun S.A.', 'Delmas 52'),
('blynn', 'administation@lebrunsa.com', 'Renica', 'Etienne', 'Lebrun S.A.', 'Delmas 52'),
('dflorestant', 'dflorestant@lebrunsa.com', 'Florestant', 'Lynn A.D.', 'Lebrun S.A.', 'Delmas 52'),
('jbangello', 'jbangelo@lebrunsa.com', 'Jean Baptiste', 'Angello', 'Lebrun S.A.', 'Delmas 52'),
('slouisjean', 'slouisjean@lebrunsa.com', 'Louis jean', 'Stephane', 'Lebrun S.A.', 'Delmas 52'),
('Jlaura', 'laurajeune@autobizsa.com', 'Jeune', 'Laura', 'Autobiz', 'Delmas 52'),
('fbellevu', 'fbellevu@autobizsa.com', 'Bellevu', 'Frantz', 'Autobiz', 'Delmas 52'),
('gjeanbaptiste', 'gjeanbaptiste@lebrunsa.com', 'Jean Baptiste', 'Gabner', 'Lebrun S.A.', 'Delmas 52'),
('jstheodore', 'jstheodore@autobizsa.com', 'Theodore', 'Jean Sebastien', 'Lebrun S.A.', 'Delmas 52'),
('keugene', 'keugene@lebrunsa.com', 'Eugene', 'Kensly', 'Lebrun S.A.', 'Delmas 52'),
('samerger', 'samerger@lebrunsa.com', 'Merger', 'Serge André', 'Lebrun S.A.', 'Delmas 52'),
('sstvictor', 's.stvictor@autobizsa.com', 'St Victor', 'Serge', 'Autobiz', 'Delmas 52')
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  nom = EXCLUDED.nom,
  prenom = EXCLUDED.prenom,
  entreprise = EXCLUDED.entreprise,
  site = EXCLUDED.site;

-- 7. INSERTION DES 16 POSTES INFORMATIQUES ASSIGNÉS
INSERT INTO it_assets (asset_tag, nom, marque, modele, numero_serie, cpu, ram, stockage, assigne_a, departement, site, statut, notes)
VALUES
('AST-PC-LEB01', 'Poste Desktop LEBHWP6KH2', 'Dell', 'OptiPlex Workstation (LEBHWP6KH2)', 'HWP6KH2', 'Intel Core i5', '8 GB RAM', '500 GB SSD', 'Roody-Max-Dominique Guerrier', 'Administration & Direction', 'Delmas 52', 'in_use', 'Windows 10 Pro Intel Core I5 @ 3.30 GHz 500 Gb SSD 8 Gb Ram • Écran Dell 22" (SN: CN-0HN22V-FCC00-22SA48B-A16)'),
('AST-PC-AUT02', 'Poste Desktop AUTDR4G9N2', 'Dell', 'OptiPlex Workstation (AUTDR4G9N2)', 'DR4G9N2', 'Intel Core i3', '16 GB RAM', '500 GB SSD', 'Alexis Dorcius', 'Opérations Commerciales', 'Delmas 52', 'in_use', 'Windows 11 Pro Intel Core I3 @3.70 GHz 500 Gb SSD 16 Gb Ram • Écran Dell 23" (SN: CN-0X5V51-TV200-08P-0J5I-A06)'),
('AST-PC-AUT03', 'Poste Desktop AUTJKZKDH2', 'Dell', 'OptiPlex Workstation (AUTJKZKDH2)', 'JKZKDH2', 'Intel Core i3', '8 GB RAM', '500 GB SSD', 'Morisset Herdritch', 'Recouvrement & Finances', 'Delmas 52', 'in_use', 'Windows 11 Pro Intel Core I3 @3.70GHz 500 Gb SSD 8 Gb Ram • Écran Dell 24" (SN: IN-0464TR-B8TFC-58E-0D0X-A01)'),
('AST-PC-LEB04', 'Poste Desktop LEB36LF4Z2', 'Dell', 'OptiPlex Workstation (LEB36LF4Z2)', '36LF4Z2', 'Intel Core i3', '8 GB RAM', '500 GB SSD', 'Julien Masha-Lyodine', 'Ventes & Commercial', 'Delmas 52', 'in_use', 'Windows 11 Pro Intel Core I3 @3.60 GHz 500 Gb SSD 8 Gb Ram • Écran Dell 22" (SN: CN-0F1XP0-FCC00-32A-AUB4B-A08)'),
('AST-PC-LEB05', 'Poste Desktop GMMSRW1', 'Dell', 'OptiPlex Workstation (GMMSRW1)', 'LEBGMMSRW1', 'Intel Core i3', '12 GB RAM', '500 GB SSD', 'Ernst Toussaint', 'Direction & Opérations', 'Delmas 52', 'in_use', 'Window 10 Pro Intel Core I3 @3.30 GHz 500 Gb SSD 12 Gb Ram • Écran Dell 27" (SN: CN-0W45GN-TV200-210-11JV-A01)'),
('AST-PC-LEB06', 'Poste Desktop LEB31PY0T2', 'Dell', 'OptiPlex Workstation (LEB31PY0T2)', '31PY0T2', 'Intel Core i5', '8 GB RAM', '500 GB SSD', 'Etienne Renica', 'Administration Générale', 'Delmas 52', 'in_use', 'Windows 11 Pro Intel Core I5 @3.20 GHz 500 Gb SSD 8 Gb Ram • Écran Dell 24" (SN: IN-0464TR-B8TFC-592-1T4X-A01)'),
('AST-PC-LEB07', 'Poste Desktop LEB1FC7XK2', 'Dell', 'OptiPlex Workstation (LEB1FC7XK2)', 'FC7XK2', 'Intel Core i5', '8 GB RAM', '500 GB SSD', 'Lynn A.D. Florestant', 'Administration & Opérations', 'Delmas 52', 'in_use', 'Windows 10 Pro Intel Core I5 @3.20GHz 500 Gb SSD 8 Gb Ram • Écran Hp 27" (SN: 3CM9380NB3)'),
('AST-PC-LEB08', 'Poste Desktop LEBHQW4HH2', 'Dell', 'OptiPlex Workstation (LEBHQW4HH2)', 'HQW4HH2', 'Intel Core i3', '12 GB RAM', '112 GB SSD', 'Angello Jean Baptiste', 'Logistique & Support', 'Delmas 52', 'in_use', 'Windows 10 Pro Intel Core I3 @3.70GHz 112 Gb SSD 8 Gb Ram • Écran Dell 24" (SN: VN-0WRR7P-WS700-55L-AKNW-A01)'),
('AST-PC-LEB09', 'Poste Desktop LEBJ33DH63', 'Dell', 'OptiPlex Workstation (LEBJ33DH63)', 'J33DH63', 'Intel Core i5', '24 GB RAM', '500 GB SSD', 'Stephane Louis Jean', 'Logistique & Entrepôt', 'Delmas 52', 'in_use', 'Windows 11 Pro Intel Core I5 @2.80GHz 500 Gb SSD 24 Gb Ram • Écran Dell 24" (SN: CN-0RYFW1-BOZOO-618-07RE-A00)'),
('AST-PC-AUT10', 'Poste Desktop AUT59PYQD2', 'Dell', 'OptiPlex Workstation (AUT59PYQD2)', '59PYQD2', 'Intel Core i3', '8 GB RAM', '500 GB SSD', 'Laura Jeune', 'Service Clientèle Autobiz', 'Delmas 52', 'in_use', 'Windows 11 Pro Intel Core I3 500 Gb SSD 8 Gb Ram • Écran Dell 21.5" (SN: CN-0XFB3-FCC00-13A-CICL-A09) • Windows lent'),
('AST-PC-AUT11', 'Poste Laptop AUTFXMQTW3', 'Dell', 'Dell Inspiron 15 Laptop', 'FXMQTW3', 'Intel Core i7', '16 GB RAM', '1 TB SSD', 'Frantz Bellevu', 'Support & Opérations Autobiz', 'Delmas 52', 'in_use', 'Windows 11 Home Intel Core I7 , 1700Mhz 1 TB SSD 16 Gb Ram Laptop (Dell inspiron 15) • Écran Dell 27" (monitor) (SN: CN-01YCHF-WSL00-315-701B-A02)'),
('AST-PC-LEB12', 'Poste Laptop LEB1H85350LG1', 'Dell', 'Dell Inspiron 15 Laptop', '1H85350LG1', 'Intel Core i3', '8 GB RAM', '256 GB SSD', 'Gabner Jean Baptiste', 'Opérations Terrain', 'Delmas 52', 'in_use', 'Windows 11 Home Intel Core I3 , 1200Mhz 250 Gb SSD 8 Gb Ram • Écran Need (SN: N/A)'),
('AST-PC-LEB13', 'Poste Desktop LEB99RSMN2', 'Dell', 'OptiPlex Workstation (LEB99RSMN2)', '99RSMN2', 'Intel Core i7', '16 GB RAM', '1 TB SSD', 'Jean Sebastien Theodore', 'Facturation & Ventes', 'Delmas 52', 'in_use', 'Windows 10 Pro Intel Core I7 , 1TB 16 Gb Ram • Écran Dell 24" (SN: CN-054RRN-FCC00-24J-A7TX-A02)'),
('AST-PC-LEB14', 'Poste Laptop LEB1H8531195N', 'HP', 'HP Victus Gaming Laptop', '1H8531195N', 'Intel Core i5', '16 GB RAM', '500 GB SSD', 'Kensly Eugene', 'Informatique & Systèmes (IT)', 'Delmas 52', 'in_use', 'Windows 11 Home Intel Core I5 16 Gb Ram 500 SSD (Victus gaming HP) • Écran Dell 27" + Dell 22" (SN: TH-0CTCNG-TVH00-5AF-25LV-A00 / CN-0HN22V-72872-668-CD4B-A00)'),
('AST-PC-LEB15', 'Poste Desktop LEBJKLHZ23', 'Dell', 'OptiPlex Workstation (LEBJKLHZ23)', 'JKLHZ23', 'Intel Core i7', '32 GB RAM', '1 TB SSD', 'Serge André Merger', 'Direction Générale', 'Delmas 52', 'in_use', 'Windows 11 Pro Intel Core I7 @3.00 GHz 1TB SSD 32 Gb Ram • Écran Dell 27" (SN: 3CM92505QF)'),
('AST-PC-AUT16', 'Poste Desktop AUT3LTJMD2', 'Dell', 'OptiPlex Workstation (AUT3LTJMD2)', '3LTJMD2', 'Intel Core i7', '16 GB RAM', '1 TB SSD', 'Serge St Victor', 'Direction Opérations Autobiz', 'Delmas 52', 'in_use', 'Windows 10 Pro Intel Core I7 @3.40Ghz  1TB SSD 16 Gb ram • Écran Dell 27" (SN: CN-0W45GN-TV200-1A2-OQNV-A00)')
ON CONFLICT (numero_serie) DO NOTHING;
