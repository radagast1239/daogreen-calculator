# Тесты и проверки (`npm run check`)

Что запускается автоматически и когда какой скрипт гонять вручную.

---

## 1. Полная проверка

```bash
npm run check
```

Цепочка (из `package.json`):

| # | Скрипт | Что проверяет |
|---|--------|----------------|
| 1 | `_tools/smoke-check.js` | CALC_BUILD, все script в HTML, `?v=` sync, синтаксис ключевых JS, wiring deps |
| 2 | `_tools/planting-modules-audit.js` | `DG_create*` фабрики, вызовы без DOM, pallet tab, vf standards |
| 3 | `_tools/bootstrap-runtime-smoke.js` | `DG_createPlantingRuntime` без браузера |
| 4 | `_tools/verify-pallet-life.js` | `replaceNote` / месяцы ↔ `АУДИТ/ПОДДОНЫ.xlsx` |
| 5 | `_tools/golden-scenarios.js` | Эталон `calcFarmEconomics` (econ-core в vm) |

Дополнительно (не в check, вручную):

```bash
node _tools/verify-pallet-sheet-mass.js
node _tools/verify-vf-sheet-mass.js
node _tools/verify-planting-tabs.js
npm run check:golden   # только golden-scenarios
```

---

## 2. smoke-check.js

Источник списка файлов: `_tools/build-manifest.js`.

Проверки:

- `CALC_BUILD` в HTML  
- Каждый `versionedScripts` подключён с `?v=BUILD`  
- vendor: html2canvas, jspdf, qrcode  
- `new Function(file)` синтаксис для списка `syntaxCheck`  
- `getActivePlantingCvId` в HTML deps (econ wiring)  
- `sw.js` CACHE совпадает с BUILD  

**Когда гонять:** после любого изменения `calculator-110x55_12.html`, `package.json` build, `sw.js`.

---

## 3. planting-modules-audit.js

Загружает модули в `vm` sandbox с mock `state` и `deps`.

- Вызов `renderAll`, `calc`, `setFacility` без падений  
- Pallet: `appView=pallets`, `PALLET_CULTIVARS` mock  
- Нет вызова `deps.syncCutMassUI` из vf-standards (локальная функция)  
- Проверка `planting-event-bindings` структуры  

**Когда:** рефакторинг runtime-init, render, event-bindings.

---

## 4. bootstrap-runtime-smoke.js

Минимальный `DG_createPlantingRuntime(plantingRuntimeDeps())` с пустыми каталогами — ловит порядок init и отсутствующие зависимости.

**Когда:** после правок `planting-runtime-init.js`, `cultivar-registry.js`.

---

## 5. verify-pallet-life.js

Сравнивает `pallet-cultivars.js` с xlsx (ПОДДОНЫ + ЦВЕТЫ): `replaceNote`, `potHarvestMonths`.

**Когда:** после `npm run sync:audit` или ручной правки `pallet-cultivars.js`.

---

## 6. verify-pallet-sheet-mass.js / verify-vf-sheet-mass.js

Загружают каталог + runtime формулы, сверяют массу/урожай с ожиданиями листа.

**Когда:** после изменений `planting-pallet-sheet.js`, `planting-vf-standards.js`, `cut-model`.

---

## 7. golden-scenarios.js

Изолированный `econ-core` в vm:

- `defaultEconState`, одна культура, `calcFarmEconomics`  
- Проверки: `revenue > 0`, `margin` число, `plantingArea`  

**Не** покрывает полный `calc()` посадки — только экономика.

Расширение: добавить сценарии в массив `checks` в файле.

---

## 8. verify-planting-tabs.js

Проверки переключения вкладок / pallet cv (если присутствует в репо).

**Когда:** баги `setAppView`, `palletCv`.

---

## 9. build

```bash
npm run build
```

`_tools/build.js`:

- Прописывает `CALC_BUILD` в HTML  
- Обновляет `?v=` на всех versioned scripts  
- Обновляет `sw.js` CACHE и PRECACHE  
- Запускает `npm run check`  

**Перед каждым деплоем.**

---

## 10. Ручной чеклист UI (после серьёзных правок)

| # | Действие |
|---|----------|
| 1 | `npm run serve` → Ctrl+F5 |
| 2 | Каналы GH: сорт, слайдер, график, урожай |
| 3 | Каналы VF: facility vertical, vf сорт |
| 4 | Поддоны: клик культур, метрики, шт-цветы |
| 5 | Георгия: toggle, руккола/салат беби |
| 6 | Экономика: импорт из посадки, 2 культуры, PDF/CSV |
| 7 | JSON export → import → то же состояние |
| 8 | `?share=demos/...json` если есть демо |
| 9 | Консоль: нет ошибок `palletCv` / `renderAll` |

---

## 11. Что делать при падении check

| Ошибка | Типичный фикс |
|--------|----------------|
| version drift | `npm run build` |
| syntax error | исправить указанный файл |
| missing script in html | добавить в HTML + build-manifest |
| modules-audit fail | отсутствующий dep в createPlanting* |
| verify-pallet-life | sync audit или исправить replaceNote |
| golden fail | регрессия в `econ-core.js` |

---

## 12. CI / локальная среда

- Windows + PowerShell: sync audit требует Expand-Archive  
- Node 18+ рекомендуется  
- Путь с кириллицей в workspace — обычно ок для Node  

---

*Манифест скриптов: `_tools/build-manifest.js`. Общая архитектура: [RECOVERY-MAP.md](./RECOVERY-MAP.md).*
