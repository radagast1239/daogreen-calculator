# Каталог сортов теплицы

## Сейчас в калькуляторе (без ваших замеров)

| Источник | Сортов | Точность |
|----------|--------|----------|
| `js/gh-cultivars.js` | 18 | ваши базовые Daogreen |
| `js/gh-cultivars-extended.js` | +75 | оценка по открытым источникам, метка **оценка** |
| `js/gh-cultivars-user.js` | 0 | пусто — добавите позже |

Итого **~93** в UI. Расчёт не менялся: логистика массы + шапка `ca·M^exp` (у оаклифа/салановы `canopyExp` 0.55–0.58).

Справочник Excel: `docs/lettuce-cultivars-reference.xlsx` (4 листа, методология на листе Sources).

## Файлы

| Файл | Назначение |
|------|------------|
| `js/gh-cultivars.js` | Базовые 18 сортов Daogreen |
| `js/gh-cultivars-extended.js` | +75 сортов из открытых источников |
| `js/gh-cultivars-user.js` | **Ваши** перебивки (подключать последним) |
| `js/gh-cultivar-catalog.js` | Группировка UI, поиск, фильтр «без оценочных» |
| `docs/LETTUCE_CULTIVARS_REFERENCE.md` | Методология и источники |

## Калибровка (когда появятся ваши данные)

1. Замеры по Excel — лист **Calibration Template** в `docs/lettuce-cultivars-reference.xlsx`.
2. Правки в `js/gh-cultivars-user.js`:

```javascript
{ id: 'rex', M_max: 195, k: 0.31, t50: 25, ca: 13.2, calibrated: true }
```

3. Обновите страницу — у сорта появится метка **калибр.**

Из Excel (лист **Calibration Template**, обычно индекс 2):

```powershell
npm run gen:gh-user -- "C:\Users\…\lettuce-cultivars-reference.xlsx"
```

Скопируйте вывод в `OVERRIDES` в `js/gh-cultivars-user.js`.

## UI каталога

- Поиск по названию, id, селекционеру, заметкам.
- Галочка **«Скрыть оценочные»** — остаются 18 базовых Daogreen, ваши `user.js` и сорта с `calibrated: true`.
- Наведение на кнопку сорта — подсказка из поля `notes` (если есть).

## canopyExp (оаклиф / саланова)

В extended для раскидистых сортов задано `canopyExp: 0.55` (шапка шире при том же весе, чем √M).
Сорта без поля ведут себя как раньше (`exp = 0.5`).

## Публикация демо

`npm run share:install-demo -- путь\к\daogreen-project-….json` → `demos/имя.json` → ссылка `?share=demos/имя.json`.
