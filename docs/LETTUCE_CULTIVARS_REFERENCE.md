# Каталог сортов салата для Daogreen

Расширенный справочник сортов салата (77 культиваров) для теплицы / гидропоники / VF, собранный из открытых источников: каталоги селекционеров (Rijk Zwaan, Enza Zaden/Vitalis, Johnny's), отчёты университетских испытаний (Purdue, UF/IFAS, Iowa, Cornell), научные статьи. Параметры выведены оценочно по методологии, описанной ниже.

## Что в комплекте

1. **`gh-cultivars-extended.js`** — JS-модуль, аддитивно расширяющий `DG_GH_CULTIVARS`. Подключается после `gh-cultivars.js`, дубликаты по `id` игнорируются.
2. **`lettuce-cultivars-reference.xlsx`** — Excel-справочник на 4 листа: все сорта таблицей, сводка по типам, шаблон калибровки, источники и методология.
3. **Этот документ** — методология, источники, протокол добавления своих сортов.

## Как подключить

В HTML-файле калькулятора, после строки с `gh-cultivars.js`:

```html
<script src="js/gh-cultivars.js"></script>
<script src="js/gh-cultivars-extended.js"></script>  <!-- новый -->
```

Скрипт сам найдёт `DG_GH_CULTIVARS` (созданный первым файлом) и добавит в него 75 новых сортов, не трогая 18 существующих. Дубликаты по `id` фильтруются — твои `aficion`, `afilion`, `starfighter`, `grazion` остаются как есть.

После подключения в каталоге сортов появятся:
- 12 батерхед (Rex, Flandria, Cosmopolia, Skyphos, Tahamata, Jannica, Halewyn, Sintia, Mirlo, Dynamite, Alkindus, Buttercrunch)
- 10 ромэнов (Salvius, Coastal Star, Parris Island, Jericho, Green Forest, Counter, Outredgeous, Tiberius, Fusion, Gladius)
- 10 батавий (Aficion-RZ, Othilie, Tourbillon, Cherokee, Nevada, Concept, Sierra, Starfighter, Grazion, Afilion-RZ)
- 8 оаклифов (Navara, Kitonia, Kiribati, Rouxaï, Panisse, Oscarde, Mondaï, Cedar)
- 8 лолло (Locarno, Satine, Carmesi, Carmolí, Amandine, Corentine, Mercato, Dark Lollo Rossa)
- 5 leaf (Red Sails, Walkmann's, Black Seeded Simpson, New Red Fire, Tropicana)
- 13 саланов (Aquino, Descartes, Pascal, Gaugin, Klee, Cook, Xandra, Humboldt, Yacht, Exact, Expertise, Triplex, Hexagon)
- 4 мини-ромэна (Bambi, Thumper, Astorga, Baeza)
- 4 айсберга (Bruma, Platinas, Morinas, Happinas)
- 3 беби (Baby Cos, Green Oak Baby, Red Salad Bowl)

## Откуда взяты данные

### Селекционеры (паспорта сортов)

**Rijk Zwaan** — Hydroponic Lettuce Assortment 2015 (PDF-каталог, 36 стр). Тип, цветовая группа, климатическая зона (temperate / sub-tropical), сезон производства, устойчивость (Bremia, Nasonovia, LMV, Fol). Описания компактности, скорости bolt, tipburn-стойкости. Основной источник для всех `*-RZ` сортов.

**Johnny's Selected Seeds** — официальный каталог Salanova® Hydroponic. Days to maturity (35–45 дн от посева для головных гидропонных). Для всех Salanova-сортов.

**Vitalis / Enza Zaden** — каталог "Hydroponic 2017–2018" с классификацией по размеру (S<150г, M 150–300г, L>300г). Mirlo, Dynamite, Fairly, Jara, Casey.

### Испытания (количественные данные)

**Purdue HO-310-W** "Performance of Lettuce Varieties in Greenhouse Hydroponic Production" (2020). Рейтинги сухой массы по 25 сортам × 40 дней × NFT/CFT × EC 1.3/2.0/2.6/3.6 dS/m. Я использовал ранжирование для калибровки `M_max` и `k` относительно других в той же группе. Самые ценные данные: butterhead Alkindus (10.2 г сух) > Buttercrunch (9.4) > Adriana > Natalia > Rex > Skyphos (5.0) > Salanova RB (2.6).

**Worth, Rogers & Reardon (2022)** "Butterhead Lettuce Variety Performance Trial in NFT" Purdue MWVTR Paper 235. Top performers по живым батерхед в NFT: Buttercrunch, Dynamite, Mirlo, Skyphos. Худшие: Teodore, Bibb (tip burn). Использовано для оценки Mirlo и Dynamite.

**Beacham et al. (2019)** "Selection of Heat Tolerant Lettuce Cultivars Grown in DWC". Romaine: Parris Island, Jericho, Coastal Star — top по жаре. Batavia: Nevada, Sierra. Использовано для проставления высоких `heatSigma` (140–150) у этих сортов.

**Practical Farmers of Iowa (Matteson 2025)** — on-farm trial 5 romaine cultivars × 3 succession × NFT в high-tunnel Айовы. Top performers по средневзвешенному весу: Fusion, Gladius, Parris Island, Sunland.

**UF/IFAS HS1258** (Parkell, Hochmuth, Laughlin 2018, обновл. 2025) — таблица рекомендованных сортов для Флориды. Markdown-классификация по типу × цвету × harvest stage (H=full head, M=mini, B=baby leaf). Использовано для проставления `season:'summer'` heat-tolerant сортам.

### Научные статьи

**Cornell CEA Lettuce Handbook** (Brechner & Both, обновл. 2013) — эталон условий DLI 17, фотопериод 16–18 ч, цикл 35 дн. Сорт-маркер Ostinata: цикл 35 дн от посева до 150 г головы. Использовано для калибровки общего диапазона `k ≈ 0.28–0.32` при канонических условиях.

**Kelly et al. (2021)** "Canopy Size and Light Use Efficiency Explain Growth Differences between Lettuce and Mizuna in Vertical Farms", Plants 10(4):704. PCS сигмоидальный рост Salanova Oak Green ('Green Salad Bowl') в VF при PPFD 50–425. Финальный PCS ~180–220 см² при PPFD ≥ 200. Использовано для валидации `d ∝ √M` и для оценки `M_max` индорных саланов.

**Wicharuck et al. (2024)** "Vertical farming for lettuce production in limited space", PeerJ 12:e17085. Baby Cos и Green Oak на 3-х ярусах теплицы Чианг Май: DLI верх/середина/низ 29/16/13 моль, FW 85–204 г/раст. R² между шириной кроны и кумулятивным DLI: 0.83 (верх), 0.26 (середина), 0.32 (низ). Использовано для baby-сортов и для понимания DLI-эффекта по ярусам.

**Jin et al. (2023)** "Light use efficiency of lettuce cultivation in vertical farms compared with greenhouse and field", Food and Energy Security. Verticality-аналитика. Sailova Expertise RZ как референс. Теоретический max yield 700 кг/м²/год при PPFD 500 непрерывном.

**Coelho et al. (2019/2020)** Brazilian "Growth Models for Lettuce Cultivars Growing in Spring/Autumn-Winter". Подгонка логистики и Гомпертца к свежей массе листьев для культиваров Ceres, Gloriosa, Grandes Lagos, Rubinela, Pira Verde, Stella. R² > 0.91. Подтверждает: логистика подходит, оба сезона работают.

## Методология оценки параметров

Все 75 добавленных сортов помечены `calibrated: false` — это **стартовые оценки, не выверенные под твою ферму**. Калибровка делается по протоколу ниже.

### M_max — целевой коммерческий вес головы (г)

| Тип | Диапазон | Логика |
|-----|----------|--------|
| Мини-ромэн, baby | 80–150 | Из breeder size class S |
| Лолло, оакфил, leaf | 160–220 | Из size class M |
| Стандартный батерхед, ромэн | 200–280 | Из size class M-L |
| Крупный батерхед (Cosmopolia), большой ромэн (Tiberius) | 300–400 | Из size class L |
| Айсберг | 400–500 | Из field-данных |

Эти значения — **товарная цель**, не физиологический максимум. При высоком DLI и длинном цикле некоторые сорта могут перерасти на 20–40%.

### k — скорость логистики (1/день)

| Категория сорта | k |
|-----------------|---|
| Медленные iceberg, тяжёлые butterhead (Halewyn, Grazion) | 0.24–0.26 |
| Стандартные butterhead, batavia, romaine | 0.28–0.30 |
| Быстрые лолло, оакфил, Salanova | 0.30–0.34 |
| Быстрые leaf (Locarno, Kiribati) | 0.34 |
| Baby/multicut | 0.40–0.46 |

Логика: для DTM_seed = 35 дн и t50 ≈ 24 дн (точка перегиба), уравнение `harvest = t50 + 1.4/k` даёт harvest = 24 + 1.4/k. При k=0.30 → harvest = 28.7 дн от высадки или ~35 дн от посева. Согласуется с Cornell и Johnny's DTM.

### t50 — день перегиба логистики (день от высадки рассады или от посева, в зависимости от твоей схемы)

| Категория | t50 |
|-----------|-----|
| Быстрые baby | 14–18 |
| Стандартные | 25–28 |
| Большие крупноголовые | 30–32 |
| Айсберг | 36–38 |

Правило: `t50 ≈ DTM − 10..12`.

### ca — коэффициент кроны (мм/√г), `d = ca·√M`

| Архитектура | ca |
|-------------|-----|
| Плотный мини (Bambi, Astorga) | 11.0–11.5 |
| Ромэн (прямостоячий, узкая голова) | 11.5–12.0 |
| Батерхед (компактная голова) | 12.5–14.0 |
| Лолло (рыхлый, frilly) | 13.5–14.5 |
| Батавия (raja semi-open) | 14.0–15.0 |
| Salanova butter/crispy | 13.5–15.0 |
| Salanova oak | 16.5–17.0 (раскидистый) |
| Оаклиф (sprawling) | 17.0–18.0 |
| Айсберг (плотный) | 12.0 |

### canopyExp — степень в `d = ca·M^p`

По умолчанию `0.5` (текущее поведение твоего калькулятора, эквивалентно `d = ca·√M`). Для сортов с рыхлой архитектурой (оаклиф, Salanova) выставлен `0.55` — это даёт чуть более быстрый рост диаметра относительно массы, что согласуется с PCS-данными Kelly et al. для Salanova Oak Green.

Если ты не хочешь использовать `canopyExp`, то функция `canopyFromMass` в `growth-light-model.js` должна остаться как есть (всегда `√M`) — поле `canopyExp` будет просто игнорироваться. Но если хочешь подключить:

```js
// в growth-light-model.js, заменить canopyFromMass:
function canopyFromMass(cv, mass, temp){
  var p = cv.canopyExp != null ? cv.canopyExp : 0.5;
  return canopyCoeff(cv, temp) * Math.pow(Math.max(mass, 0.1), p);
}
```

Это полностью обратно совместимо: сорта без `canopyExp` (твои 18 исходных) ведут себя ровно как сейчас.

### t_opt — оптимальная температура (°C)

Из breeder climate zone:
- Temperate (RZ "temperate growing conditions"): 20–21 °C
- Sub-tropical с пометкой "хорошо летом": 22–23 °C
- Tropical-стойкие (Aficion, Starfighter, Grazion, Jericho, Coastal Star): 24–25 °C

### heatSigma и heatBolt — отклик на жару

`heatSigma` входит в гауссиану `exp(-(T-t_opt)²/(2σ))` — чем больше σ, тем шире "окно" терпимой температуры. `heatBolt` × (T − t_opt − 3) сокращает день bolt.

| Жаростойкость | heatSigma | heatBolt |
|---------------|-----------|----------|
| Очень чувствительные (зимние RZ Halewyn, Pazmanea) | 60 | 1.7–1.9 |
| Стандартные temperate (Rex, Flandria) | 70–80 | 1.3–1.5 |
| Универсальные | 90–110 | 1.0–1.2 |
| Жаростойкие batavia/romaine (Cherokee, Nevada, Parris Island) | 130–140 | 0.8–0.9 |
| Топ-жаростойкие (Aficion, Starfighter, Jericho, Coastal Star) | 140–150 | 0.7–0.8 |

### bolt — день стрелкования при t_opt

Из breeder descriptors:
- "slow-bolting" → +5 дн к базе
- "very slow-bolting" → +10 дн
- "summer variety", "strong against bolting" → +12 дн
- Базовая зона для салата: ~35–45 дн от посева до начала bolt.

## Что добавлять своими руками

### Если у тебя есть замеры с твоей фермы

Воспользуйся листом **"Calibration Template"** в Excel-файле. Заполни замеры массы и диаметра раз в 3–4 дня (минимум 6 точек), потом подгонкой через Solver (или `scipy.optimize.curve_fit`) получи свои M_max, k, t50, canopyExp, ca.

После калибровки можно либо отредактировать поле прямо в `gh-cultivars-extended.js`, либо завести отдельный `gh-cultivars-user.js`, где переопределить значения:

```js
// gh-cultivars-user.js
(function(global){
  // Найти существующий сорт и обновить его параметры из своей калибровки
  var rex = (global.DG_GH_CULTIVARS || []).find(function(c){ return c.id === 'rex'; });
  if (rex) {
    rex.M_max = 195;     // твой замер
    rex.k = 0.31;        // твоя подгонка
    rex.t50 = 23;        // твоя подгонка
    rex.ca = 13.2;       // твоя подгонка
    rex.canopyExp = 0.52;
    rex.calibrated = true;
    rex.calibration = {
      n_samples: 28,
      r2_mass: 0.94,
      r2_canopy: 0.91,
      conditions: 'DLI 14, T 22°C, NFT',
      date: '2026-01-15'
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
```

Подключи после `gh-cultivars-extended.js` — твои значения перебьют дефолты.

### Если хочешь добавить новый сорт

В том же `gh-cultivars-user.js`:

```js
(global.DG_GH_CULTIVARS || []).push({
  id: 'my-cultivar-id',
  name: 'Мой Сорт',
  sub: 'описание для UI',
  breeder: 'я сам',
  type: 'butterhead',
  season: 'year_round',
  M_max: 250, k: 0.30, t50: 25, ca: 13.5, canopyExp: 0.5,
  bolt: 44, multicut: false, heatSigma: 90, heatBolt: 1.1, t_opt: 22, babyGreen: false,
  calibrated: true,
  notes: 'Источник: мои замеры январь 2026, ферма Москва'
});
```

## Известные ограничения

1. **k и ca — теоретические оценки, не калибровки.** Для production-точности нужно собрать данные с твоих ферм по топ-10 сортам. Каталог в текущем виде надёжно отличает "лолло от ромэна", но не различает близкие сорта внутри одной группы по реальной скорости роста.

2. **`canopyExp = 0.55` для оаклифа/салановы** — мой инженерный заход на основе Kelly 2021. На разных DLI он может быть другим.

3. **`heatSigma` — это эвристика**, а не прямая физиологическая величина. Откалибровать её можно только специальным температурным экспериментом.

4. **Сезонные предпочтения** (`season: 'summer'`, `'winter'`) взяты из breeder catalogs и не учитывают конкретный регион (Москва vs Дубай vs Чианг Май будут давать разные результаты на одном и том же сорте).

5. **Айсберг и крупные butterhead не оптимизированы для VF.** Они в каталоге для теплицы; на стеллажах их выращивать невыгодно по экономике.

## Логика приоритетов калибровки

Если бы я выбирал, какие 10 сортов калибровать первыми, я бы взял те, которые:
1. Чаще всего просят клиенты → Rex, Lollo Rossa (одна из ваших), Romaine, Salanova-сорта, Frillis
2. Самые рискованные по экономике (большая M_max, чувствительные к ошибкам) → Cosmopolia, Halewyn, Grazion
3. Жаростойкие для южных регионов → Aficion, Coastal Star, Jericho

Полный каталог из 95 сортов (18 твоих + 75 новых) позволит клиенту выбрать сорт по визуальной характеристике (тип, цвет, сезон), а ты при необходимости можешь точнее настроить ходовые. Это лучше, чем держать 18 сортов и говорить "остальное мы не считаем".
