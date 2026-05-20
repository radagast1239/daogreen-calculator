# Share, auth, readonly, preview

Как открыть калькулятор гостям, заблокировать правки и не сломать расчёт.

Деплой: [HOSTING.md](../HOSTING.md). Общая карта: [RECOVERY-MAP.md](./RECOVERY-MAP.md).

---

## 1. Режимы доступа (сводка)

| Режим | Как включается | Что можно |
|-------|----------------|-----------|
| **Обычный** | Вход (Netlify / local auth) | Всё |
| **Предпросмотр** | GitHub Pages без сессии, `auth-preview` | Смотреть вкладки, раскрывать блоки; **нет** правок |
| **Share** | `?share=demos/foo.json` | Загрузить демо-проект, readonly |
| **Readonly** | Кнопка «Просмотр» / `?readonly=1` | Как preview для полей, но локально |
| **Share-lock** | `DG_SHARE_PENDING` при загрузке share | Принудительный readonly |

---

## 2. Share по ссылке

**Файл:** `js/share-view.js` (ранний script, до boot).

### URL

```
calculator-110x55_12.html?share=demos/mangold-channels.json
```

Альтернатива: `?share=1&project=demos/....json`

### Безопасность пути

`isAllowedShareRef`:

- Относительный путь: `demos/name.json`, без `..` и `\`
- HTTPS same-origin `.json`
- `https://raw.githubusercontent.com/.../*.json`

Иначе `DG_SHARE_ERROR`, загрузка не идёт.

### Поток

1. `DG_SHARE_PENDING = true` → readonly  
2. `fetch(shareUrl)` → JSON проекта `{ v, build, state }`  
3. `DG_onShareReady` → `applyProjectState(state)`  
4. `daogreen-app-ready` — калькулятор готов  

Демо-файлы: папка `demos/`, см. `demos/README.md`.

Установка примера:

```bash
npm run share:install-demo
```

---

## 3. Readonly (кнопка «Просмотр»)

**Файл:** `js/readonly-mode.js`

| | |
|--|--|
| Storage | `daogreen-readonly` = `'1'` |
| URL | `?readonly=1` |
| CSS | `html.read-only-mode` |

Блокирует:

```css
html.read-only-mode .page button:not([data-readonly-allow]) { pointer-events: none; }
```

Разрешены элементы с **`data-readonly-allow`** и **`data-preview-allow`** (вкладки, `.cv-btn`, collapse-head, PDF в шапке).

**Share и preview** принудительно readonly (`isShareLocked()`).

---

## 4. Auth (серверный вход)

### Netlify

- Functions: `netlify/functions/auth-*.js`
- Env: `AUTH_USER`, `AUTH_PASS`, `AUTH_SECRET`
- Cookie HttpOnly, 7 суток
- **Пароль не в репозитории**

### Локально с API

```bash
copy .env.example .env
npm run serve:auth
```

`npm run serve` — **без** входа, только статика.

### GitHub Pages (клиентский вход)

```bash
# .env: AUTH_USER, AUTH_PASS
npm run auth:config   # → js/auth-client-config.js (только хеш)
git add js/auth-client-config.js
```

**Файл:** `js/app-auth.js` + `js/auth-client-config.js` (генерируется, не править хеш вручную).

Сессия: `sessionStorage`, 7 суток.

Ограничение: статика на GH Pages — защита от случайных гостей, не от reverse-engineering JS.

---

## 5. Предпросмотр (auth-preview)

**Когда:** GH Pages без активной сессии → `html.auth-preview`.

**Файл:** `js/preview-config.js` — **дефолтный state** для гостей.

| Поле | Пример смысла |
|------|----------------|
| `appView` | `channels` / `pallets` / `economics` |
| `facility` | `greenhouse` / `vertical` |
| `cv` | `lollo`, `aficion` |
| слайдеры | `temp`, `day`, `density`, … |
| `georgyMode` | **всегда false** |

Гости **не** видят ваш `localStorage` — только `preview-config.js`.

### Сборка preview из живого проекта

1. Войти в калькулятор, выставить UI, **выключить Георгия**  
2. Экспорт JSON (кнопка в шапке)  
3. `npm run preview:from-project -- путь\к\project.json`  
4. `git add js/preview-config.js && git push`

Скрипт: `_tools/project-to-preview-config.js`.

### CSS preview

`calculator-110x55_12.html`: блок `html.auth-preview` — разрешены `.app-tab`, `.cv-btn`, `.collapse-head`, `[data-preview-allow]`.

Скрыты: вход, Георгий, часть econ-bridge.

---

## 6. Связь с калькулятором

| Глобал | Назначение |
|--------|------------|
| `DG_isShareMode()` | share активен |
| `DG_SHARE_PENDING` | ждём fetch |
| `DG_isPreviewMode()` | auth-preview |
| `DG_initReadonlyMode` | кнопка просмотра |
| `DG_initPreviewConfig` | подмешать preview state при boot |

`bootApp`: если `DG_onShareReady` и pending — отложенный `applyProjectState` после загрузки.

---

## 7. Диагностика

| Симптом | Решение |
|---------|---------|
| Share 404 | файл в `demos/`, путь `.json`, CORS same-origin |
| «Недопустимый путь» | regex в `isAllowedShareRef` |
| Гость видит чужие данные | не путать с localStorage; обновить preview-config |
| Культуры не кликаются | `data-readonly-allow` на `.cv-btn`; не share-lock |
| Вход не работает локально | `serve:auth`, `.env` |
| После входа preview | `auth-preview` снимается при сессии |

---

## 8. Чеклист публикации демо

1. Собрать JSON проекта с нужной вкладкой/сортом  
2. Положить в `demos/`, проверить `?share=demos/....json`  
3. Опционально обновить `preview-config.js` для GH Pages  
4. `npm run build`, деплой  
5. Не коммитить `.env` с паролем  

---

*PDF и проекты: [PDF-PROJECTS-RECOVERY.md](./PDF-PROJECTS-RECOVERY.md).*
