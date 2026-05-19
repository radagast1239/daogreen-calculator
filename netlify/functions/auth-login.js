const auth = require('./_lib/auth-shared');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return auth.jsonResponse(405, { ok: false, error: 'Method not allowed' });
  }
  const cfg = auth.getAuthConfig();
  if (!cfg.configured) {
    return auth.jsonResponse(503, {
      ok: false,
      error: 'Сервер: задайте AUTH_USER, AUTH_PASS и AUTH_SECRET в Netlify → Environment variables'
    });
  }
  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return auth.jsonResponse(400, { ok: false, error: 'Некорректный запрос' });
  }
  if (!auth.checkCredentials(body.login, body.password, cfg)) {
    return auth.jsonResponse(401, { ok: false, error: 'Неверный логин или пароль' });
  }
  const secure = String(event.headers['x-forwarded-proto'] || '').indexOf('https') >= 0;
  return auth.jsonResponse(200, { ok: true }, {
    'Set-Cookie': auth.makeSessionCookie(cfg.secret, secure)
  });
};
