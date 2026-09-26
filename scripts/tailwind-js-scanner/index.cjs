/* eslint-disable */
"use strict";

/**
 * Scanner Tailwind CSS de secours, en JavaScript pur.
 *
 * Pourquoi : Tailwind v4 repere les classes utilisees dans le code avec un
 * scanner natif (@tailwindcss/oxide). Sur cette machine, une politique Windows
 * "Application Control" bloque le fichier natif. Tailwind bascule alors sur sa
 * version WebAssembly, mais celle-ci ne lit aucun fichier sous Windows : le CSS
 * est genere sans aucune classe utilitaire (plus de flex, p-4, bg-..., etc.).
 *
 * Ce module remplace le scanner uniquement quand celui d'origine ne trouve
 * aucun fichier. Si le scanner natif fonctionne, il n'est pas touche.
 *
 * Il ne charge aucun binaire : il lit les fichiers sources et en extrait tous
 * les mots qui pourraient etre des classes. Tailwind ignore ensuite ceux qui ne
 * sont pas de vraies classes.
 */

const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");

const SOURCE_EXTENSIONS = new Set([
  ".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs", ".mts", ".cts",
  ".html", ".htm", ".vue", ".svelte", ".astro",
]);
const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", ".svn", ".hg", ".turbo", ".vercel",
]);
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_TOKEN_LENGTH = 200;

// Tout ce qui est entre guillemets, apostrophes, backticks, espaces ou chevrons.
const WORD_RE = /[^<>"'`\s]*[^<>"'`\s:]/g;
// Valeurs arbitraires qui peuvent contenir des guillemets : bg-[url('/x.png')]
const BRACKET_RE = /[^\s"'`<>\[\]{}()]*\[[^\]\s<]*\][^\s"'`<>\[\]{}()]*/g;
const HAS_FRAGMENT_CHAR_RE = /[{}(),;=$|?]/;
const FRAGMENT_SPLIT_RE = /[{}(),;=$|?]+/;

const toPosix = (p) => p.split(path.sep).join("/");

/** Convertit un motif glob (**, *, ?, {a,b}, [abc]) en expression reguliere. */
function globToRegExp(glob) {
  let re = "";
  let braces = 0;
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        if (glob[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 2;
        } else {
          re += ".*";
          i += 1;
        }
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else if (c === "{") {
      re += "(?:";
      braces++;
    } else if (c === "}" && braces > 0) {
      re += ")";
      braces--;
    } else if (c === "," && braces > 0) {
      re += "|";
    } else if (c === "[" && glob.indexOf("]", i + 1) > i) {
      const end = glob.indexOf("]", i + 1);
      re += glob.slice(i, end + 1);
      i = end;
    } else {
      re += c.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
    }
  }
  return new RegExp("^" + re + "$");
}

/** Lecture simplifiee du .gitignore : noms, chemins et motifs avec *. */
function loadIgnoreRules(base) {
  let text = "";
  try {
    text = fs.readFileSync(path.join(base, ".gitignore"), "utf8");
  } catch {
    return [];
  }
  const rules = [];
  for (let line of text.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    const dirOnly = line.endsWith("/");
    let pattern = line.replace(/\/+$/, "");
    const anchored = pattern.includes("/");
    pattern = pattern.replace(/^\/+/, "");
    if (!pattern) continue;
    rules.push({ regex: globToRegExp(pattern), anchored, dirOnly });
  }
  return rules;
}

function isIgnored(rules, relPosix, name, isDir) {
  for (const rule of rules) {
    if (rule.dirOnly && !isDir) continue;
    if (rule.regex.test(rule.anchored ? relPosix : name)) return true;
  }
  return false;
}

function walk(root, rules, onDir, onFile) {
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    onDir(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = toPosix(path.relative(root, full));
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        if (isIgnored(rules, rel, entry.name, true)) continue;
        stack.push(full);
      } else if (entry.isFile()) {
        if (isIgnored(rules, rel, entry.name, false)) continue;
        onFile(full, rel);
      }
    }
  }
}

function addToken(token, out) {
  if (!token || token.length > MAX_TOKEN_LENGTH || token.includes("://") || token.includes("${")) return;
  const clean = token.replace(/^[;{}(),=]+|[;{}(),=]+$/g, "");
  if (!clean || clean.length > MAX_TOKEN_LENGTH || clean.includes("://") || clean.includes("${")) return;
  out.add(clean);
  if (HAS_FRAGMENT_CHAR_RE.test(clean)) {
    for (const part of clean.split(FRAGMENT_SPLIT_RE)) {
      const p = part.replace(/^[;{}(),=]+|[;{}(),=]+$/g, "");
      if (p && p.length <= MAX_TOKEN_LENGTH && !p.includes("://") && !p.includes("${")) out.add(p);
    }
  }
}

function extractCandidates(content, out) {
  for (const match of content.matchAll(WORD_RE)) addToken(match[0], out);
  for (const match of content.matchAll(BRACKET_RE)) addToken(match[0], out);
}

/** Cree un test "ce fichier est exclu" a partir d'une source negative (@source not). */
function compileNegation({ base, pattern }) {
  const root = path.resolve(base);
  const regex = globToRegExp(pattern);
  const asDir = pattern.replace(/\/+$/, "") + "/";
  return (file) => {
    const rel = toPosix(path.relative(root, file));
    if (rel.startsWith("..") || path.isAbsolute(rel)) return false;
    return pattern === "**/*" || regex.test(rel) || rel.startsWith(asDir);
  };
}

class JsScanner {
  constructor(options = {}) {
    this.sources = options.sources || [];
    this._cache = new Map();
    this._files = [];
    this._globs = [];
  }

  get files() {
    return this._files;
  }

  get globs() {
    return this._globs;
  }

  scan() {
    const files = new Set();
    const dirs = new Set();
    const excluded = this.sources.filter((s) => s.negated).map(compileNegation);
    const addFile = (file) => {
      if (!excluded.some((test) => test(file))) files.add(file);
    };

    for (const source of this.sources) {
      if (source.negated) continue;
      const root = path.resolve(source.base);
      const pattern = source.pattern || "**/*";

      if (pattern === "**/*") {
        walk(
          root,
          loadIgnoreRules(root),
          (dir) => dirs.add(dir),
          (file) => {
            if (SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase())) addFile(file);
          },
        );
      } else if (!/[*?{}\[\]]/.test(pattern)) {
        const target = path.resolve(root, pattern);
        let stat = null;
        try {
          stat = fs.statSync(target);
        } catch {}
        if (stat && stat.isFile()) addFile(target);
        else if (stat && stat.isDirectory()) {
          walk(target, loadIgnoreRules(target), (dir) => dirs.add(dir), (file) => {
            if (SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase())) addFile(file);
          });
        }
      } else {
        const regex = globToRegExp(pattern);
        walk(root, [], () => {}, (file, rel) => {
          if (regex.test(rel)) addFile(file);
        });
      }
    }

    const candidates = new Set();
    for (const file of files) {
      for (const token of this._tokensFor(file)) candidates.add(token);
    }

    this._files = Array.from(files);
    this._globs = Array.from(dirs).map((base) => ({ base, pattern: "*" }));
    return Array.from(candidates);
  }

  _tokensFor(file) {
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      return [];
    }
    if (stat.size > MAX_FILE_BYTES) return [];
    const cached = this._cache.get(file);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return cached.tokens;
    }
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      return [];
    }
    const set = new Set();
    extractCandidates(text, set);
    const tokens = Array.from(set);
    this._cache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, tokens });
    return tokens;
  }
}
JsScanner.isJsFallback = true;

/** Le scanner d'origine lit-il vraiment des fichiers ? Test sur le dossier de ce module. */
function originalScannerWorks(oxide) {
  try {
    const probe = new oxide.Scanner({
      sources: [{ base: __dirname, pattern: "**/*", negated: false }],
    });
    probe.scan();
    return probe.files.length > 0;
  } catch {
    return false;
  }
}

let announced = false;

function announce() {
  if (announced) return;
  announced = true;
  console.warn(
    "[tailwind] Scanner natif indisponible : utilisation du scanner JavaScript de secours.",
  );
}

/**
 * A appeler depuis postcss.config avant le chargement de @tailwindcss/postcss.
 * Renvoie true si le scanner de secours a ete active.
 *
 * Deux cas de panne sont geres :
 *  1. @tailwindcss/oxide se charge (version WebAssembly) mais ne lit aucun
 *     fichier : on remplace seulement sa classe Scanner.
 *  2. @tailwindcss/oxide ne se charge pas du tout (binaire natif bloque et pas
 *     de version WebAssembly installee) : on le remplace dans le cache de
 *     modules par un module minimal qui ne contient que Scanner.
 */
function install() {
  let resolved;
  try {
    resolved = require.resolve("@tailwindcss/oxide");
  } catch {
    return false; // Tailwind n'est pas installe : rien a faire.
  }

  let oxide = null;
  try {
    oxide = require("@tailwindcss/oxide");
  } catch {
    oxide = null;
  }

  if (oxide) {
    if (typeof oxide.Scanner !== "function") return false;
    if (oxide.Scanner.isJsFallback) return true;
    if (originalScannerWorks(oxide)) return false;
    oxide.Scanner = JsScanner;
    announce();
    return true;
  }

  const stub = new Module(resolved, module);
  stub.filename = resolved;
  stub.paths = Module._nodeModulePaths(path.dirname(resolved));
  stub.exports = { Scanner: JsScanner };
  stub.loaded = true;
  require.cache[resolved] = stub;
  announce();
  return true;
}

module.exports = { install, JsScanner, extractCandidates, globToRegExp };
