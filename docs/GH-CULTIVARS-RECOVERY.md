# Теплица (каналы GH): сорта и стандарты

Вкладка **Каналы**, `facility === 'greenhouse'`. Сорта **не** из Excel-аудита в рантайме — правятся в JS-файлах (часть extended — из справочника/оценок).

---

## 1. Файлы каталога

| Файл | Содержимое |
|------|------------|
| `js/gh-cultivars.js` | Базовые 18 сортов → `global.DG_GH_CULTIVARS` |
| `js/gh-cultivars-extended.js` | Доп. сорта (оценки RZ и др.), merge без дубликатов id |
| `js/gh-cultivars-user.js` | Патчи полей по id (OVERRIDES), может быть пустым |
| `js/gh-cultivar-catalog.js` | Группы UI: батавия, ромэн, беби… |
| `js/gh-cv-colors.js` | Цвета линий сравнения |

Порядок в HTML (после inline deps):

```text
gh-cultivars.js → gh-cultivars-extended.js → gh-cultivar-catalog.js → gh-cultivars-user.js → gh-cv-colors.js
```

В runtime:

```javascript
const CULTIVARS = global.DG_GH_CULTIVARS || [];
allGhCultivars() = CULTIVARS + state.customGhCultivars
```

---

## 2. Поля сорта GH (типичные)

| Поле | Назначение |
|------|------------|
| `id` | без префикса: `aficion`, `lollo`, `rucola-baby` |
| `name`, `sub` | UI |
| `M_max`, `k`, `t50` | Логистика массы |
| `ca` | Покров ∝ √масса |
| `bolt`, `heatSigma`, `heatBolt`, `t_opt` | Цветение, жара |
| `multicut` | Многосрезка |
| `babyGreen` | true → группа «беби», 2 ряда в Георгии |
| `type` | Опционально: `batavia`, `romaine`… для каталога |
| `calibrated` | Бейдж «калибровано» в каталоге |
| `notes` | Подсказка на кнопке |

**Нет** `vfSheet` / `palletSheet` — это признаки листов VF/поддонов.

Алиас id: `romaine` → `little-gem` в `cultivar-registry.js`.

---

## 3. Активный сорт и расчёт

| Поле state | Значение |
|------------|----------|
| `state.cv` | id активного GH сорта |
| `getCv()` | find в `allGhCultivars()` |
| `calc()` | полная логистика + `plantLayout` + сезонный DLI |

Отличие от VF/поддонов: используется **месяц** `state.month`, **досвет** `state.lighting`, `NATURAL_DLI`.

---

## 4. UI каталога культур

### Простой режим

Две группы в `renderCultivars`: салат / беби (`babyGreen`).

### Расширенный каталог

Если `DG_useGroupedGhCultivarUi` + `DG_groupGhCultivars`:

- Поиск `.cv-catalog-search`
- Фильтр «только калиброванные»
- `<details class="cv-category">` по типу из `gh-cultivar-catalog.js`
- Кнопки `data-id` (не `data-vf-id` / `data-pl-id`)

Обработчик клика: `state.cv = ghId` при `appView !== 'pallets'`.

---

## 5. Пользовательские стандарты GH

**Модуль:** `js/planting-gh-standards.js`  
**Storage:** `localStorage` ключ `calc-gh-user-standards` → `state.ghStandards[cvId]`.

| Функция | Назначение |
|---------|------------|
| `loadGhStandardsStore` / `saveGhStandardsStore` | Персистентность |
| `buildDefaultGhStandards(cv)` | Шаблон по сорту |
| `getGhCvStandards(cv)` | Текущие нормативы |
| `applyGhStandardFromStore` | Залить в state слайдеры |
| `renderGhStandardsPanel` | Панель «Стандарты» (теплица) |
| `ghCutCount`, `ghCutMasses` | Многосрезка: число и массы срезок |
| `syncGhCutsUI` | UI срезок |

При смене сорта, если нет записи — создаётся `state.ghStandards[state.cv]`.

### Связь с multicut

`state.multicut`, `state.cutInterval`, `state.ghCutCount` — для GH салатов с многосрезкой.  
`cut-model.js` → `supportsMulticut`, `applyCutIntervalHarvestMods` в `calc()`.

---

## 6. Свои сорта GH

**Модуль:** `js/planting-custom-cv.js`  
**Storage:** `calc-custom-cultivars`  
**State:** `state.customGhCultivars[]`

Кнопка «+ Добавить свой сорт» — копия активного или шаблон `blankGhCultivarTemplate()`.

---

## 7. Урожай с площади (теплица)

**Модуль:** `js/planting-gh-yield.js`

- Полезная площадь: `state.ghUsefulArea` (localStorage)
- Блок «Урожай с полезной площади теплицы» — только GH каналы
- На поддонах подписи другие (см. i18n `gh.yield.titlePallet`)

Цепочка: `calc()` → `withUsefulAreaYield` → `planting-useful-yield.js`.

---

## 8. Синхронизация с Excel (ограничение)

Каналы **теплицы** в `АУДИТ/КАНАЛЫ.xlsx` используются скриптом sync для **`vf-cultivars.js`**, не для `DG_GH_CULTIVARS`.

GH-список в `gh-cultivars.js` — **отдельный curated-набор** (RZ, внутренние нормативы).  
Обновление GH: правка JS или генераторы в `_tools/gen-gh-user-from-xlsx.js` (отдельная задача).

---

## 9. Режим Георгия

На GH каналах включается `georgy-mode.js` — отдельный профиль беби/салат.  
См. [GEORGY-MODE-RECOVERY.md](./GEORGY-MODE-RECOVERY.md).

При включении Георгия: фильтр списка сортов, подстановка плотности/срезок, `appView` с поддонов сбрасывается.

---

## 10. Экономика и проекты

- Активный id: `state.cv`
- Снимок: `getPlantingSnapshotForCvId` → `applyGhProfileToStateOnly` + `calc()`
- Импорт: [ECONOMICS-RECOVERY.md](./ECONOMICS-RECOVERY.md)

---

## 11. Диагностика

| Симптом | Проверить |
|---------|-----------|
| Нет сорта в списке | extended загружен? дубликат id отброшен? |
| Каталог пустой при поиске | `DG_filterGhCatalogList`, строка поиска |
| Срезки не сохраняются | `ghStandards`, `saveGhStandardsStore` |
| little-gem vs romaine | алиас в registry + миграция в loadGhStandardsStore |
| Урожай GH странный | `ghUsefulArea`, multicut, `planting-useful-yield` |

---

## 12. Чеклист правки GH сорта

1. Добавить объект в `gh-cultivars.js` или extended (уникальный `id`)
2. При необходимости — `LEGACY_TYPE` / `type` в `gh-cultivar-catalog.js`
3. `npm run check`, UI: каналы → выбор → метрики
4. При multicut — проверить панель срезок и экономику

---

*Общая карта посадки: [RECOVERY-MAP.md](./RECOVERY-MAP.md).*
