# Размещение калькулятора Daogreen

Калькулятор — **статический сайт** (HTML + JS). Сервер нужен только для раздачи файлов и корректной работы PDF/PWA; базы данных нет.

## Перед выкладкой

```bash
npm run build
```

Команда выравнивает версии скриптов (`?v=`), обновляет service worker и проверяет целостность (`npm run check`).

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

Скопируйте **всю папку проекта** на хостинг (или только нужные файлы: `calculator-110x55_12.html`, `index.html`, `manifest.webmanifest`, `sw.js`, `icons/`, `js/`, `vf-cultivars.js`, `pallet-cultivars.js` и каталоги `КАНАЛЫ` / `ПОДДОНЫ КАССЕТЫ`, если используете встроенные таблицы).

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
