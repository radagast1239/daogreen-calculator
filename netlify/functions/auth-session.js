const auth = require('./_lib/auth-shared');

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return auth.jsonResponse(405, { ok: false, error: 'Method not allowed' });
  }
  const cfg = auth.getAuthConfig();
  if (!cfg.configured) {
    return auth.jsonResponse(503, { ok: false, configured: false });
  }
  const session = auth.sessionFromRequest(event);
  if (!session) {
    return auth.jsonResponse(401, { ok: false });
  }
  return auth.jsonResponse(200, { ok: true });
};
