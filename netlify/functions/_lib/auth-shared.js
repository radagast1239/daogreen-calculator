/** Подпись сессии (Netlify Functions). */
'use strict';

const crypto = require('crypto');

const COOKIE_NAME = 'dg_auth';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromB64url(str) {
  str = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

function signToken(payload, secret) {
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(crypto.createHmac('sha256', secret).update(body).digest());
  return body + '.' + sig;
}

function verifyToken(token, secret) {
  if (!token || !secret) return null;
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;
  const body = parts[0];
  const sig = parts[1];
  const expect = b64url(crypto.createHmac('sha256', secret).update(body).digest());
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  } catch (_) {
    return null;
  }
  let payload;
  try {
    payload = JSON.parse(fromB64url(body).toString('utf8'));
  } catch (_) {
    return null;
  }
  if (!payload || !payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  String(header).split(';').forEach(function (part) {
    const i = part.indexOf('=');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

function getAuthConfig() {
  const secret = process.env.AUTH_SECRET;
  const user = process.env.AUTH_USER || 'daogreen';
  const pass = process.env.AUTH_PASS;
  return { secret, user, pass, configured: !!(secret && pass) };
}

function checkCredentials(login, password, cfg) {
  cfg = cfg || getAuthConfig();
  if (!cfg.configured) return false;
  return (
    String(login || '').trim().toLowerCase() === String(cfg.user).trim().toLowerCase() &&
    String(password || '') === String(cfg.pass)
  );
}

function makeSessionCookie(secret, secure) {
  const token = signToken({ exp: Date.now() + MAX_AGE_MS, v: 1 }, secret);
  const flags = [
    COOKIE_NAME + '=' + encodeURIComponent(token),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + Math.floor(MAX_AGE_MS / 1000)
  ];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

function clearSessionCookie(secure) {
  const flags = [COOKIE_NAME + '=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

function sessionFromRequest(eventOrReq) {
  const cfg = getAuthConfig();
  if (!cfg.configured) return null;
  let cookieHeader = '';
  if (eventOrReq && eventOrReq.headers) {
    cookieHeader = eventOrReq.headers.cookie || eventOrReq.headers.Cookie || '';
  }
  const cookies = parseCookies(cookieHeader);
  return verifyToken(cookies[COOKIE_NAME], cfg.secret);
}

function jsonResponse(status, body, extraHeaders) {
  return {
    statusCode: status,
    headers: Object.assign(
      { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      extraHeaders || {}
    ),
    body: JSON.stringify(body)
  };
}

module.exports = {
  COOKIE_NAME,
  getAuthConfig,
  checkCredentials,
  makeSessionCookie,
  clearSessionCookie,
  sessionFromRequest,
  jsonResponse
};
