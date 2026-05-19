/**
 * Скопируйте в auth-client-config.js или выполните: npm run auth:config
 * passHash — SHA-256(salt + login + ':' + пароль), пароль в файл не пишите.
 */
(function (g) {
  g.DG_AUTH_CLIENT = {
    login: 'daogreen',
    passHash: 'ЗАМЕНИТЕ_через_npm_run_auth_config',
    salt: 'daogreen-calc-auth-v1',
    maxAgeDays: 7
  };
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
