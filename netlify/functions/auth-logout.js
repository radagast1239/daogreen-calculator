const auth = require('./_lib/auth-shared');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return auth.jsonResponse(405, { ok: false, error: 'Method not allowed' });
  }
  const secure = String(event.headers['x-forwarded-proto'] || '').indexOf('https') >= 0;
  return auth.jsonResponse(200, { ok: true }, {
    'Set-Cookie': auth.clearSessionCookie(secure)
  });
};
