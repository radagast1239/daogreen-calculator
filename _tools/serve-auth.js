/**
 * Локальный сервер: статика + те же auth API, что на Netlify.
 * Запуск: npm run serve:auth  (нужен файл .env в корне проекта)
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const auth = require('./auth-shared');

const ROOT = path.join(__dirname, '..');
const PORT = parseInt(process.env.PORT || '8080', 10);

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .forEach(function (line) {
      const t = line.trim();
      if (!t || t.charAt(0) === '#') return;
      const i = t.indexOf('=');
      if (i < 0) return;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (k && process.env[k] == null) process.env[k] = v;
    });
}

function readBody(req) {
  return new Promise(function (resolve) {
    let data = '';
    req.on('data', function (chunk) {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on('end', function () {
      resolve(data);
    });
  });
}

function netlifyEvent(req, body, cookie) {
  return {
    httpMethod: req.method,
    body: body,
    headers: {
      cookie: cookie || req.headers.cookie || '',
      'x-forwarded-proto': 'http'
    }
  };
}

const loginHandler = require(path.join(ROOT, 'netlify', 'functions', 'auth-login.js'));
const sessionHandler = require(path.join(ROOT, 'netlify', 'functions', 'auth-session.js'));
const logoutHandler = require(path.join(ROOT, 'netlify', 'functions', 'auth-logout.js'));

async function handleAuth(req, res, pathname) {
  const cookie = req.headers.cookie || '';
  let result;
  if (pathname.endsWith('auth-login') && req.method === 'POST') {
    const body = await readBody(req);
    result = await loginHandler.handler(netlifyEvent(req, body, cookie));
  } else if (pathname.endsWith('auth-session') && req.method === 'GET') {
    result = await sessionHandler.handler(netlifyEvent(req, '', cookie));
  } else if (pathname.endsWith('auth-logout') && req.method === 'POST') {
    result = await logoutHandler.handler(netlifyEvent(req, '', cookie));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false }));
    return;
  }
  const headers = Object.assign({}, result.headers || {});
  res.writeHead(result.statusCode, headers);
  res.end(result.body);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2'
};

function serveStatic(req, res, urlPath) {
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath.replace(/^\//, '')));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

loadEnvFile();
const cfg = auth.getAuthConfig();
if (!cfg.configured) {
  console.warn('');
  console.warn('  ВНИМАНИЕ: создайте файл .env в корне (см. .env.example)');
  console.warn('  AUTH_USER, AUTH_PASS, AUTH_SECRET — без них вход не работает.');
  console.warn('');
}

const server = http.createServer(async function (req, res) {
  const u = new URL(req.url, 'http://127.0.0.1');
  if (u.pathname.indexOf('/.netlify/functions/') === 0) {
    try {
      await handleAuth(req, res, u.pathname);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Auth error: ' + e.message);
    }
    return;
  }
  serveStatic(req, res, decodeURIComponent(u.pathname));
});

server.listen(PORT, function () {
  console.log('');
  console.log('  Daogreen — сервер с проверкой входа');
  console.log('  http://localhost:' + PORT + '/calculator-110x55_12.html');
  console.log('  Логин/пароль из .env (не из кода страницы)');
  console.log('');
});
