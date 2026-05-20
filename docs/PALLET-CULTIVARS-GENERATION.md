# Поддоны: Excel → pallet-cultivars.js

Пошаговая инструкция, как устроен справочник поддонов, откуда берутся числа и как безопасно обновлять файл после правок в Excel.

Связано: [RECOVERY-MAP.md](./RECOVERY-MAP.md) §12, [CULTIVAR_CATALOG.md](./CULTIVAR_CATALOG.md).

---

## Оглавление

1. [Файлы в репозитории](#1-файлы-в-репозитории)
2. [Источники Excel](#2-источники-excel)
3. [Канонический пайплайн (рекомендуется)](#3-канонический-пайплайн-рекомендуется)
4. [Как читается xlsx](#4-как-читается-xlsx)
5. [Сопоставление имён](#5-сопоставление-имён)
6. [Функция plC и поля сорта](#6-функция-plc-и-поля-сорта)
7. [Формулы midUpper и pickCells](#7-формулы-midupper-и-pickcells)
8. [Подключение в приложении](#8-подключение-в-приложении)
9. [Проверки после генерации](#9-проверки-после-генерации)
10. [Устаревший путь _gen-pallet-cultivars.js](#10-устаревший-путь-_gen-pallet-cultivarsjs)
11. [Частые ошибки](#11-частые-ошибки)

---

## 1. Файлы в репозитории

| Путь | Роль |
|------|------|
| `АУДИТ/ПОДДОНЫ.xlsx` | Основная таблица: беби / взрослые (не цветы) |
| `АУДИТ/ЦВЕТЫ.xlsx` | Секция «Цветы пищевые» (другие колонки) |
| `АУДИТ/КАНАЛЫ.xlsx` | Только для VF (`vf-cultivars.js`), не для поддонов |
| `pallet-cultivars.js` | **Результат** — `window.PALLET_SHEET` |
| `_tools/sync-vf-audit-lib.js` | Ядро: чтение xlsx, парсинг, `plC`, запись |
| `_tools/sync-vf-audit-xlsx.js` | Точка входа: `node _tools/sync-vf-audit-xlsx.js` |
| `АУДИТ/sync-report.md` | Отчёт последней синхронизации |
| `_tools/verify-pallet-life.js` | Сверка `replaceNote` / месяцев с xlsx |
| `_tools/verify-pallet-sheet-mass.js` | Сверка масс в рантайме |
| `_tools/_gen-pallet-cultivars.js` | **Старый** генератор из HTML (не основной) |

---

## 2. Источники Excel

### 2.1. ПОДДОНЫ.xlsx (`kind = 'pallet'`)

Строки-заголовки секций (пропускаются как сорта):

- «Беби зелень…» → `section = 'baby'`
- «Цветы пищевые» — в этом файле может не быть; цветы чаще в **ЦВЕТЫ.xlsx**
- «Взрослая зелень / салаты D6» → `section = 'adult'`

Колонки для **поддонов** (индексы 0-based в `parseSectionRows`):

| Col | Поле в audit row |
|-----|------------------|
| 0 | name |
| 1 | germ |
| 2 | ch (дни в фазе / канал) |
| 3 | den (плотность) |
| 4 | cells (кассеты / ячейки) |
| 5 | cut (текст или число интервала) |
| 6 | avgCut |
| 7 | replace (срок жизни / замена) |
| 8 | yCut (урожай за срез) |

### 2.2. ЦВЕТЫ.xlsx (`kind = 'flowers'`)

| Col | Поле |
|-----|------|
| 0 | name |
| 1 | germ |
| 2 | ch |
| 4 | den (плотность; col 3 пропущен) |
| 5 | cells |
| 6 | cut |
| 7 | avgCut |
| 8 | replace |
| 9 | yCut |

Для цветов в `plC` часто `{ unit: 'шт', partialCut: true }`.

---

## 3. Канонический пайплайн (рекомендуется)

### Шаг 0. Подготовка

- Windows + Node.js (как для `npm run serve`)
- Excel закрыт (файлы не заблокированы)
- Правки только в `АУДИТ/*.xlsx`, **не** править `pallet-cultivars.js` руками (перезапишется)

### Шаг 1. Обновить xlsx

Внести изменения в `АУДИТ/ПОДДОНЫ.xlsx` и/или `АУДИТ/ЦВЕТЫ.xlsx`.

### Шаг 2. Запустить синхронизацию

Из корня репозитория:

```bash
node _tools/sync-vf-audit-xlsx.js
```

Или через npm:

```bash
npm run sync:audit
```

Скрипт:

1. Читает три xlsx → три `Map` ключей `section|normalizedName`
2. Парсит существующий `pallet-cultivars.js` (строки `plC(...)`)
3. Для каждого сорта подтягивает поля из audit map (`applyAuditRow`)
4. Перезаписывает **`pallet-cultivars.js`** и **`vf-cultivars.js`**
5. Пишет **`АУДИТ/sync-report.md`**

### Шаг 3. Прочитать отчёт

Открыть `АУДИТ/sync-report.md`:

- таблица «было → стало» по урожаю за срез
- **Не сопоставлено в JS** — есть в xlsx, нет строки `plC` (нужно добавить `plC` вручную в js или исправить имя)
- **Не сопоставлено в xlsx** — есть в JS, нет в таблице (устаревший сорт или опечатка)

### Шаг 4. Добавить новый сорт (если нужно)

Синхронизация **не создаёт** новые `plC` — только обновляет существующие строки.

Новый сорт:

1. Добавить строку в Excel
2. Скопировать шаблон `plC` в `pallet-cultivars.js` (соседняя строка)
3. Задать уникальный `id`: `pl-...` (обычно `pl-` + имя из vf, если клонировали с VF)
4. Снова `node _tools/sync-vf-audit-xlsx.js` — подтянутся числа из xlsx

### Шаг 5. Проверки

```bash
node _tools/verify-pallet-life.js
node _tools/verify-pallet-sheet-mass.js
npm run check
```

### Шаг 6. Сборка и UI

```bash
npm run build
```

Открыть калькулятор через сервер → вкладка **Поддоны** → badge «каталог N сортов» → клик по культурам.

---

## 4. Как читается xlsx

**Файл:** `_tools/sync-vf-audit-lib.js` → `readSheetRows(path)`.

Механизм (без npm xlsx):

1. Копия `.xlsx` → `_tools/_audit.zip`
2. PowerShell `Expand-Archive`
3. Парс `xl/sharedStrings.xml` + первый лист `xl/worksheets/sheet*.xml`
4. Ячейки → `rows[rowIndex][colIndex]`
5. `normalizeCell` — даты Excel-сериал, пробелы

**Требование:** PowerShell доступен (Windows по умолчанию).

---

## 5. Сопоставление имён

Ключ: `matchKey(name, section)` = `section + '|' + normName(name)`.

`normName`:

- lower case
- `\` → `/`
- схлопывание пробелов
- `пак-чой` → `пак чой`

`XLSX_NAME_ALIASES` — ручные соответствия («салат ромен» / «рукола дракон» / «бегония/пеларгония/герань» …).

**Секции:**

| section | Группа в UI |
|---------|-------------|
| `baby` | Беби-зелень |
| `flowers` | Цветы |
| `adult` | Взрослые D6 |

Для `flowers` данные берутся из `АУДИТ/ЦВЕТЫ.xlsx`, для остальных поддонов — из `ПОДДОНЫ.xlsx`.

---

## 6. Функция plC и поля сорта

В **сгенерированном** `pallet-cultivars.js` каждая строка вида:

```javascript
plC('pl-viola', 'Виола', 'flowers', '5-6', '35', '60/30', '9', 'Срезается…', '7', '20-30', { partialCut: true, unit: 'шт', … }),
```

Аргументы `plC(id, name, section, germ, ch, den, cellsStr, cut, avgCut, yCut, opts)`:

| # | Параметр | В state после plC |
|---|----------|-------------------|
| 1 | id | `id` (`pl-*`) |
| 2 | name | `name` |
| 3 | section | `section` |
| 4–6 | germ, ch, den | `germination`, `channelDays`, `density` (+ `*Std` строки) |
| 7 | cellsStr | `palletCells` через `pickCells` |
| 8–9 | cut, avgCut | `cutInterval`, `cutNote`, multicut |
| 10 | yCut | `yieldPerCutG`, `countUnit` |
| opts | `unit: 'шт'`, `partialCut`, `replaceNote`, `multicut: false`, … |

Всегда: `palletSheet: true`, логистика `M_max`, `k`, `t50`, `ca`, `bolt` для расчёта массы в калькуляторе.

### Правило урожая для поддонов (в sync)

В отчёте: **Поддоны — `midUpper` для всех числовых полей** (в отличие от VF, где урожай в граммах может быть `hi × 1.125`).

---

## 7. Формулы midUpper и pickCells

### 7.1. midUpper(s) — число из диапазона в ячейке

Примеры ячеек: `20-30`, `60/30`, `7-14`, `до 12`.

```text
извлечь все числа → lo, hi
mid = (lo + hi) / 2
midUpper = (mid + hi) / 2   // смещение к верхней части диапазона
```

Используется для: germination, channelDays, density, cutInterval, yieldPerCutG.

### 7.2. pickCells(cellsStr)

Допустимые кассеты: **6, 8, 9, 14, 20, 24, 54**.

- `14/24` → берётся первая часть, ближайшее из списка
- диапазон `14-24` → max концов → ближайшее значение

Результат: `palletCells` в сорте, `palletCellsStd` — исходная строка для UI.

### 7.3. replaceMonthsFromNote

Из `replaceNote` + `cutNote` → `potHarvestMonths` (для экономики и подсказок):

- «до года» / вечноцвет → 12
- «N нед» → месяцы
- «N месяц» → N

---

## 8. Подключение в приложении

### 8.1. Загрузка скрипта

`calculator-110x55_12.html`:

```html
<script src="pallet-cultivars.js?v=BUILD"></script>
```

До `cultivar-registry.js` и inline.

### 8.2. Попадание в state

Inline (~3215):

```javascript
const PALLET_CULTIVARS = (window.PALLET_SHEET && window.PALLET_SHEET.PALLET_CULTIVARS.length)
  ? window.PALLET_SHEET.PALLET_CULTIVARS
  : [];
```

Если файл не загрузился (404, file://, старый SW) → **массив пустой**:

- предупреждение `pallet-load-warn.js`
- на поддонах показываются культуры **теплицы** (ветка else в `renderCultivars`)
- клики по `pl-*` не работают

### 8.3. Цепочка использования

```text
PALLET_CULTIVARS
  → planting-runtime-init (deps)
  → cultivar-registry: allPalletCultivars, getPalletCv, isPalletCvId
  → renderCultivars: plBtn, data-pl-id
  → click: state.palletCv, resetPalletStdToSheetDefaults, initPalletValuesFromSheet
  → calc(): calcFromPalletSheet(getPalletCv())
  → planting-pallet-sheet.js
```

### 8.4. Замки palletStd

`resetPalletStdToSheetDefaults()` выставляет все ключи `palletStd.* = true` и заливает state из листа.

Пользователь снимает замок чекбоксами в UI стандартов (VF-сетка на панели культуры).

---

## 9. Проверки после генерации

| Команда | Что проверяет |
|---------|----------------|
| `node _tools/verify-pallet-life.js` | `replaceNote` / `potHarvestMonths` ↔ xlsx |
| `node _tools/verify-pallet-sheet-mass.js` | масса/урожай в расчёте |
| `node _tools/planting-modules-audit.js` | наличие модулей, `state.appView=pallets` |
| `npm run check` | полный набор smoke + golden |

Ручная проверка:

1. `PALLET_CULTIVARS.length` в консоли на вкладке поддонов
2. Цветок: урожай в **шт**, заголовок урожая «со всей площади фермы»
3. Импорт в экономику для `pl-*` — `unitIsPieces` где нужно

---

## 10. Устаревший путь _gen-pallet-cultivars.js

**Не использовать** для актуальной синхронизации с аудитом.

Исторически:

- читал `Лист1.html` + клонировал строки из `vf-cultivars.js`
- подставлял колонку «кассеты» из HTML-таблицы
- писал `pallet-cultivars.js` с функцией `mid`, а не `midUpper`

Сейчас источник истины — **xlsx в АУДИТ/** и **`sync-vf-audit-xlsx.js`**.

---

## 11. Частые ошибки

| Проблема | Причина | Решение |
|----------|---------|---------|
| Каталог 0 сортов | не загружен js / пустой PALLET_CULTIVARS | сервер, `npm run build`, Ctrl+F5 |
| Сорт в отчёте «не сопоставлено» | нет `plC` или другое имя | добавить строку / alias в `XLSX_NAME_ALIASES` |
| Числа не те | правили js, не xlsx | править Excel → sync заново |
| VF обновился, поддоны нет | забыли sync | один скрипт обновляет **оба** файла |
| PowerShell ошибка | нет Expand-Archive | запуск на Windows или доработать readSheetRows |
| Дубли id `pl-` | копипаст plC | уникальные id |
| multicut выключен | `multicut: false` в opts | проверить cutInterval и opts в plC |
| Экономика 0 для pl | snapshot / countUnit | [ECONOMICS-RECOVERY.md](./ECONOMICS-RECOVERY.md) |

---

## Быстрая шпаргалка команд

```bash
# 1. Синхронизация Excel → js
node _tools/sync-vf-audit-xlsx.js

# 2. Проверки
node _tools/verify-pallet-life.js
npm run check

# 3. Версии для браузера
npm run build

# 4. Локальный просмотр
npm run serve
# → http://localhost:8080/calculator-110x55_12.html
```

---

*При смене колонок в Excel обновите `parseSectionRows` в `sync-vf-audit-lib.js` и этот документ.*
