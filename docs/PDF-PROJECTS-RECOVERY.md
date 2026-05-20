# PDF и проекты (JSON)

Экспорт отчёта в PDF и сохранение/загрузка полного состояния калькулятора.

---

## 1. Проекты JSON

**Модуль:** `js/project-store.js` — `DG_initProjectStore(deps)`

### Формат файла

```json
{
  "v": 1,
  "build": "2026-05-20-p109-pdf-sections",
  "exportedAt": "2026-05-20T12:00:00.000Z",
  "state": { ... весь state посадки + econ + georgy ... }
}
```

| Поле | Проверка |
|------|----------|
| `v` | должно быть `1` |
| `state` | передаётся в `applyProjectState` |

### Кнопки UI

| Действие | Метод |
|----------|--------|
| Скачать JSON | `exportProject()` → Blob download |
| Сохранить в браузере | `localStorage` `daogreen-calc-project-v1` |
| Загрузить файл | `pickFile` → `applySnapshot` |
| Сравнение | `project-compare.js` (отдельный dialog) |

### applyProjectState

**Файл:** `planting-app-nav.js` → `applyProjectState(imported)`

1. `Object.assign` полей в `state`  
2. Миграции econ: `ensureEconCultures`, equipment, …  
3. `saveGhStandardsStore`, `saveVfStandardsStore`, `saveEconStore`, …  
4. `setAppView(state.appView)`  
5. Toast «проект загружен»

**Важно:** загрузка проекта на **поддонах** восстанавливает `palletCv`, `palletStd`, геометрию — снимки вкладок `plantingSnapshots` отдельно (не в JSON проекта).

### Share

Демо для share — тот же формат JSON. См. [SHARE-AUTH-READONLY-RECOVERY.md](./SHARE-AUTH-READONLY-RECOVERY.md).

---

## 2. PDF экспорт

**Модуль:** `js/pdf-export.js` — `DG_initPdfExport(deps)`

Зависимости: `html2canvas`, `jspdf` (vendor).

### Инициализация

Из inline: `initPlantingPdfExport()` передаёт:

- `renderAll`, `renderEconomics`
- `getExportMeta` — шапка PDF (сорт, масса, режим, build)
- `pdfFilename` — slug от имени сорта

### Секции PDF

Массив `SECTIONS` — id, группа (`planting` | `economics`), CSS-селектор DOM.

Примеры id:

- Посадка: `panel-cultivars`, `panel-culture`, `block-panel-growth`, `panel-metrics`, `panel-schema`, `panel-pallet-geom`, …
- Экономика: `econ-cultures`, `econ-results`, `econ-payback`, …
- `panel-georgy-simple` — **`georgyOnly: true`** (только если режим Георгия)

Пресеты: `PDF_PRESETS.planting`, `PDF_PRESETS.econ`, `DEFAULT_SELECTED`.

### Процесс экспорта

1. Диалог выбора секций (`#pdf-export-dialog`)  
2. Для каждой секции: `html2canvas` на DOM (или vector table для econ-yield)  
3. Сборка в jsPDF, A4, поля `PDF_MARGIN_MM`  
4. Шрифты: кириллица через встроенные/подключённые (см. комментарии в pdf-export — при проблемах «квадратики» нужен сервер и шрифт)

### Экономика в PDF

**Модуль:** `js/pdf-econ-tables.js` — таблицы для vectorId `econ-yield-summary` и др.

Перед PDF: желательно `renderEconomics()` чтобы цифры актуальны.

### Публичный API

`js/planting-public-api.js`:

```javascript
DG_exportEconCsv(calcFarmEconomics(state.econ), { build })
```

CSV экономики — отдельно от PDF.

---

## 3. Сравнение проектов

**Модуль:** `js/project-compare.js`  
Кнопка `#btn-project-compare` — загрузка 2 JSON, таблица отличий.

Не меняет текущий `state` до подтверждения (см. реализацию dialog).

---

## 4. Резюме для шапки

**Модуль:** `js/project-summary.js` — текст/цифры из `calc()` + `calcFarmEconomics` для отображения (не PDF).

---

## 5. Что попадает в state при экспорте проекта

Практически весь `DG_createDefaultPlantingState` + накопленное:

- `cv`, `vfCv`, `palletCv`, `facility`, `appView`
- `ghStandards`, `vfUserStandards`, `palletStd`, `econ`
- `customGhCultivars`, `customVfCultivars`
- `comparePick`, `sectionCollapsed`, `georgyMode`, …

**Не попадает автоматически:**

- localStorage стандарты под другим ключом, если не в state
- Service Worker cache

После import вызываются `save*Store` из applyProjectState.

---

## 6. Диагностика

| Симптом | Решение |
|---------|---------|
| PDF пустой блок | секция скрыта CSS (`env-block-hidden`), georgyOnly |
| Квадраты вместо букв | шрифт PDF, не file:// |
| JSON «неверная версия» | `v: 1` в файле |
| После import неверная вкладка | `state.appView` в JSON |
| PDF econ нули | открыть вкладку экономики, `renderEconomics` перед экспортом |
| html2canvas обрезает | `PDF_W_PX`, свёрнутые collapse — раскрыть панели |

---

## 7. Чеклист

1. Выставить сценарий в UI  
2. Экспорт JSON → перезагрузка страницы → import → сверка  
3. PDF: выбрать пресет planting/econ, проверить кириллицу  
4. Share-ссылка на тот же JSON в `demos/`  
5. `npm run build` после смены `pdf-export.js`

---

*Экономика в PDF: [ECONOMICS-RECOVERY.md](./ECONOMICS-RECOVERY.md).*
