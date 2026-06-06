# Размещение калькулятора Daogreen

Калькулятор — **статический сайт** (HTML + JS). Сервер нужен только для раздачи файлов и корректной работы PDF/PWA; базы данных нет.

## Перед выкладкой

```bash
npm run build
```

Команда выравнивает версии скриптов и CSS (`?v=`), обновляет service worker и проверяет целостность (`npm run check`).

## Локально (разработка)

**Windows:** двойной клик `start-server.bat` или:

```bash
npm run serve
```

Откройте в браузере:

- http://localhost:8080/
- http://localhost:8080/calculator-110x55_12.html

Не открывайте HTML напрямую через `file://` — не работают PDF-шрифты, service worker и часть скриптов.

## Статический хостинг

Скопируйте **всю папку проекта** на хостинг (или минимум: `calculator-110x55_12.html`, `index.html`, `manifest.webmanifest`, `sw.js`, `icons/`, `assets/`, `css/`, `js/`, `vf-cultivars.js`, `pallet-cultivars.js`).

Справочники сортов уже **встроены** в `vf-cultivars.js` и `pallet-cultivars.js`. Исходные эталонные таблицы — в папке `АУДИТ/` (см. [АУДИТ/README.md](АУДИТ/README.md)); для деплоя xlsx не нужны.

| Платформа | Как |
|-----------|-----|
| **Nginx / Apache** | `root` на папку проекта; `index index.html calculator-110x55_12.html;` |
| **GitHub Pages** | Репозиторий → Settings → Pages → branch / folder |
| **Netlify / Vercel / Cloudflare Pages** | Deploy folder, build command: `npm run build`, publish: корень |

### Пример Nginx

```nginx
server {
    listen 80;
    server_name calc.example.com;
    root /var/www/daogreen-calc;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|woff2?|ttf|svg|webmanifest)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

Для **установки PWA** на телефон/ПК нужен **HTTPS** (Let's Encrypt на nginx или HTTPS у Netlify/GitHub Pages).

## PWA (установка как приложение)

1. Сайт открыт по **https://** (или `localhost` для теста).
2. В Chrome/Edge: меню → «Установить приложение» / иконка в адресной строке.
3. После обновления версии выполните `npm run build` и обновите файлы на сервере; пользователю — **Ctrl+F5** или переустановка (меняется `sw.js` и кэш).

Офлайн: закэшированы основные скрипты и оболочка; полноценная работа без сети не гарантируется (PDF, CDN-fallback библиотек).

## Проверка после деплоя

1. Внизу экрана — зелёная плашка **«Сборка …»** (актуальный идентификатор).
2. `npm run check` на машине сборки перед заливкой.
3. Экспорт PDF на вкладке «Экономика» — таблицы читаемы, кириллица не «квадратиками».
4. DevTools → Application → Service Workers — статус **activated**.

## Синхронизация копий

Держите одну рабочую папку (не дублируйте «на рабочий стол» без синхронизации). После правок всегда `npm run build` и одна и та же сборка на сервере и у разработчиков.

## Документация для разработки

Главный индекс: **[docs/RECOVERY-MAP.md](docs/RECOVERY-MAP.md)** — карта зависимостей, `state`, boot, формулы, «что на что влияет».

| Тема | Файл |
|------|------|
| Экономика | [docs/ECONOMICS-RECOVERY.md](docs/ECONOMICS-RECOVERY.md) |
| Поддоны из Excel | [docs/PALLET-CULTIVARS-GENERATION.md](docs/PALLET-CULTIVARS-GENERATION.md) |
| VF из Excel | [docs/VF-CULTIVARS-GENERATION.md](docs/VF-CULTIVARS-GENERATION.md) |
| Эталоны АУДИТ (xlsx → JS) | [АУДИТ/README.md](АУДИТ/README.md) |
| GH каталог | [docs/GH-CULTIVARS-RECOVERY.md](docs/GH-CULTIVARS-RECOVERY.md) |
| Режим Георгия | [docs/GEORGY-MODE-RECOVERY.md](docs/GEORGY-MODE-RECOVERY.md) |
| Share / auth / readonly | [docs/SHARE-AUTH-READONLY-RECOVERY.md](docs/SHARE-AUTH-READONLY-RECOVERY.md) |
| PDF и проекты JSON | [docs/PDF-PROJECTS-RECOVERY.md](docs/PDF-PROJECTS-RECOVERY.md) |
| Тесты (`npm run check`) | [docs/TESTING-RECOVERY.md](docs/TESTING-RECOVERY.md) |
| Справочник сортов | [docs/CULTIVAR_CATALOG.md](docs/CULTIVAR_CATALOG.md) |

---

## Вход по логину (серверная проверка)

Пароль **не хранится в коде страницы**. Проверка идёт через **Netlify Functions** (`netlify/functions/`), сессия — в **HttpOnly-cookie** (7 суток).

### Настройка на Netlify (рекомендуется)

1. Репозиторий подключён к Netlify, в корне есть `netlify.toml`.
2. **Site configuration → Environment variables** (для Production):

   | Переменная | Пример |
   |------------|--------|
   | `AUTH_USER` | `daogreen` |
   | `AUTH_PASS` | ваш пароль (придумайте новый, не из чата) |
   | `AUTH_SECRET` | длинная случайная строка (32+ символа) |

   Образец: файл `.env.example` в проекте.

3. **Build command:** `npm run build`  
   **Publish directory:** `.` (корень)

4. После деплоя: откройте сайт → форма входа → логин/пароль из переменных Netlify.

5. **Deploy → Trigger deploy → Clear cache and deploy site** — после смены переменных.

### Локально с серверным входом

```bash
copy .env.example .env
# отредактируйте .env — свои AUTH_USER, AUTH_PASS, AUTH_SECRET
npm run serve:auth
```

Откройте http://localhost:8080/calculator-110x55_12.html

Обычный `npm run serve` **не** подключает API входа — только статика.

### GitHub Pages (вход без Netlify / VPN)

На GitHub Pages **нет** серверных Functions. Включён **локальный вход** (хеш пароля, без открытого текста в коде):

```bash
# в .env задайте AUTH_USER и AUTH_PASS, затем:
npm run auth:config
git add js/auth-client-config.js
git push
```

В репозиторий попадает только **хеш** пароля (`js/auth-client-config.js`), не сам пароль.  
Сессия — 7 суток в браузере (`sessionStorage`). Это защита от случайных гостей; **не** от целенаправленного взлома статики (JS всё равно можно изучить).

**Без входа** сайт открывается в **режиме предпросмотра**: видны все вкладки и блоки (можно переключать вкладки, теплица/VF, раскрывать секции), но поля и кнопки расчёта не работают. Полный доступ — после входа по кнопке «Войти».

### Что видно в предпросмотре (данные по умолчанию)

Предпросмотр **не отдельная страница** — тот же калькулятор с заблокированным вводом. Цифры задаются в **`js/preview-config.js`** (можно коммитить в GitHub):

| Поле | Смысл |
|------|--------|
| `appView` | Вкладка: `channels`, `pallets`, `economics` |
| `facility` | `greenhouse` или `vertical` |
| `cv` | Сорт на вкладке каналов (например `lollo`, `aficion`) |
| `temp`, `day`, `nch`, `density` … | Слайдеры посадки |
| `georgyMode` | В предпросмотре всегда **выкл.**; кнопка «Расчёт для Георгия» скрыта |

**Проще всего — через JSON (без ручного редактирования кода):**

1. Войдите в калькулятор (логин/пароль).
2. Выставьте всё, как должны видеть гости (вкладка, сорт, температура…). **Режим Георгия выключите.**
3. Нажмите **«JSON»** в шапке — скачается файл `daogreen-project-….json`.
4. В папке проекта:
   ```bash
   npm run preview:from-project -- путь\к\daogreen-project-….json
   ```
5. `git add js/preview-config.js && git push`

Можно прислать этот JSON — по нему соберут `preview-config.js`.

**Важно:** до входа гости видят только `preview-config.js`, не ваш `localStorage`. После входа — полный калькулятор.

Смена пароля: правьте `.env` → снова `npm run auth:config` → `git push`.

### GitHub Pages без входа

Альтернативы: Netlify (если доступен), Cloudflare Access, пароль в панели российского хостинга.

---

## Как защититься от копирования конкурентами

**Важно понимать:** любой, кто **вошёл** в калькулятор, в браузере может сохранить HTML/JS (как «Сохранить как» или через DevTools). Серверный вход **закрывает сайт для посторонних**, но **не шифрует** код от своих пользователей. Полной «невозможности скопировать» у статического сайта нет.

### Уровни защиты (чем больше слоёв — тем лучше)

| Уровень | Что даёт |
|---------|----------|
| **1. Серверный вход** (уже в проекте) | Логин/пароль только на сервере; без входа калькулятор не открыть |
| **2. Пароль на весь сайт в Netlify** | Site configuration → **Access control** → Password protection (платный план) — даже прямую ссылку на `.js` не откроют без пароля |
| **3. Не светить ссылку** | Не выкладывать URL в открытый доступ, не индексировать (`robots.txt` уже `Disallow: /`) |
| **4. Приватный репозиторий** | Код на GitHub в **private** repo; публичный Pages на этот репозиторий не вешать |
| **5. Отдельный пароль** | Смените пароль после настройки; не отправляйте в открытых чатах |
| **6. Юридически** | © в футере, договор с партнёрами о запрете передачи |

### Чего не делать

- Не публиковать на **публичный** GitHub Pages без защиты, если боитесь утечки.
- Не считать, что «скрытый» URL безопасен — ссылку могут переслать.
- Не хранить `AUTH_PASS` в репозитории — только в Netlify / `.env` (`.env` в `.gitignore`).

### Если нужен максимум для «своих»

1. Netlify + переменные `AUTH_*` + **Password protection** на сайт.  
2. Выдавать доступ только проверенным людям.  
3. Периодически менять пароль и `AUTH_SECRET` (после смены secret все сессии сбросятся).
