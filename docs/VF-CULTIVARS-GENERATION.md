# VF / каналы: Excel → vf-cultivars.js

Справочник **вертикальной фермы и каналов** (`facility === 'vertical'` на вкладке «Каналы»).  
Парный документ для поддонов: [PALLET-CULTIVARS-GENERATION.md](./PALLET-CULTIVARS-GENERATION.md).

---

## 1. Файлы

| Путь | Роль |
|------|------|
| `АУДИТ/КАНАЛЫ.xlsx` | Беби / взрослые (не цветы) |
| `АУДИТ/ЦВЕТЫ.xlsx` | Секция цветов (колонки как у поддонов-flowers) |
| `vf-cultivars.js` | Результат → `window.VF_SHEET` |
| `_tools/sync-vf-audit-lib.js` | Парсинг xlsx, `vfC`, запись |
| `_tools/sync-vf-audit-xlsx.js` | `npm run sync:audit` |
| `АУДИТ/sync-report.md` | Отчёт синхронизации |

**Один скрипт обновляет и VF, и поддоны** — всегда смотрите отчёт целиком.

---

## 2. Пайплайн

```bash
# 1. Правки в Excel
# 2. Синхронизация
npm run sync:audit
# или: node _tools/sync-vf-audit-xlsx.js

# 3. Проверки
npm run check

# 4. Версии в браузере
npm run build
```

Новые сорта: добавить строку `vfC(...)` в `vf-cultivars.js` вручную, затем снова sync.

---

## 3. Колонки Excel (каналы)

`parseSectionRows(..., 'kanaly')` — как у поддонов без колонки cells:

| Col | Поле |
|-----|------|
| 0 | name |
| 1 | germ |
| 2 | ch |
| 3 | den |
| 4 | cut |
| 5 | avgCut |
| 6 | replace |
| 7 | yCut |

Цветы — из `ЦВЕТЫ.xlsx`, см. [PALLET-CULTIVARS-GENERATION.md](./PALLET-CULTIVARS-GENERATION.md) §2.2.

---

## 4. Правила чисел (отличие от поддонов!)

| Параметр | VF (`vfC`) | Поддоны (`plC`) |
|----------|------------|-----------------|
| germ, ch, den, cut | **mid** — середина диапазона | **midUpper** — к верхней границе |
| Урожай за срез (г) | **hi(yCut) × 1.125** | **midUpper(yCut)** |
| Урожай (шт) | **hi(yCut)** без ×1.125 | **midUpper** |
| Кассеты | нет в vfC | `pickCells` в plC |

Зачем ×1.125 для граммов: консервативная верхняя оценка урожая по аудиту каналов (см. комментарий в `sync-report.md`).

### vfC в коде (генератор)

```javascript
germination = round(mid(germ))
channelDays = round(mid(ch))
density = round(mid(den))
yieldPerCutG = round(hi(yCut) * (unit === 'шт' ? 1 : 1.125))
cutInterval = round(mid(avgCut) || mid(cut))
multicut = cutInterval > 0 || partialCut
```

Поля сорта: `vfSheet: true`, id префикс `vf-`, секции `baby` | `flowers` | `adult`.

---

## 5. В приложении

### Загрузка

```html
<script src="vf-cultivars.js?v=BUILD"></script>
```

До `pallet-cultivars.js` и inline.

```javascript
const VF_CULTIVARS = window.VF_SHEET.VF_CULTIVARS || [];
```

### Когда используется

| Условие | Поведение |
|---------|-----------|
| `appView === 'channels'` && `facility === 'vertical'` | `calc()` → `calcFromVfSheet(getVfCv())` |
| Кнопки культур | `data-vf-id`, обработчик в `#cultivars` |
| Активный id | `state.vfCv` |
| Замки | `state.vfStd` + `vfUserStandards` (localStorage) |

Модули: `js/planting-vf-standards.js`, `js/planting-vf-user-standards.js`.

### Не путать с поддонами

- VF на **каналах** — лист VF, `vfCv`, геометрия **каналов** (`plantLayout`).
- **Поддоны** — отдельная вкладка `appView === 'pallets'`, `PALLET_SHEET`, даже если `facility === 'vertical'`.

---

## 6. Сопоставление имён

Те же `normName`, `matchKey(section|name)`, `XLSX_NAME_ALIASES`, что и для поддонов (`sync-vf-audit-lib.js`).

Секция `flowers` всегда из `ЦВЕТЫ.xlsx`.

---

## 7. Диагностика

| Симптом | Действие |
|---------|----------|
| На VF пустой каталог | `VF_CULTIVARS.length`, загрузка `vf-cultivars.js`, сервер не file:// |
| Урожай не совпадает с Excel | проверить hi×1.125 для г, шт без множителя |
| После sync только VF изменился | нормально; поддоны в том же коммите |
| Строка в «не сопоставлено» | alias или новая `vfC` |

---

## 8. Связанные проверки

- `node _tools/verify-vf-sheet-mass.js` — масса/урожай VF
- `npm run sync:audit` → `АУДИТ/sync-report.md`
- Импорт в экономику: [ECONOMICS-RECOVERY.md](./ECONOMICS-RECOVERY.md) (`isVfCvId`, `vf-*`)

---

*При смене правил mid/hi обновите `sync-vf-audit-lib.js` (vfC) и этот файл.*
