/**
 * Создаёт js/auth-client-config.js из .env (AUTH_USER, AUTH_PASS).
 * Пароль в репозиторий не попадает — только хеш.
 * Запуск: npm run auth:config
 */
'use strict';

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SALT = 'daogreen-calc-auth-v1';
const OUT = path.join(ROOT, 'js', 'auth-client-config.js');

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .forEach(function (line) {
      const t = line.trim();
      if (!t || t.charAt(0) === '#') return;
      const i = t.indexOf('=');
      if (i < 0) return;
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    });
  return out;
}

function passHash(login, pass) {
  return crypto
    .createHash('sha256')
    .update(SALT + '\n' + String(login).trim().toLowerCase() + ':' + String(pass))
    .digest('hex');
}

const env = loadEnv();
const login = env.AUTH_USER || process.argv[2] || 'daogreen';
const pass = env.AUTH_PASS || process.argv[3];

if (!pass) {
  console.error('Укажите пароль: в файле .env (AUTH_PASS) или: node _tools/write-auth-client-config.js логин пароль');
  process.exit(1);
}

const hash = passHash(login, pass);
const body =
  '/** Сгенерировано npm run auth:config — пароль в открытом виде здесь НЕ хранится. */\n' +
  '(function (g) {\n' +
  '  g.DG_AUTH_CLIENT = {\n' +
  '    login: ' + JSON.stringify(String(login).trim()) + ',\n' +
  '    passHash: ' + JSON.stringify(hash) + ',\n' +
  '    salt: ' + JSON.stringify(SALT) + ',\n' +
  '    maxAgeDays: 7\n' +
  '  };\n' +
  "})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);\n";

fs.writeFileSync(OUT, body, 'utf8');
console.log('Записано: js/auth-client-config.js');
console.log('Логин:', login);
console.log('Дальше: git add js/auth-client-config.js && git push (на GitHub Pages)');
