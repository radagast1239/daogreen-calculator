/**
 * Расширенный каталог сортов салата для теплицы / гидропоники / VF.
 * 
 * ИСТОЧНИКИ ДАННЫХ (открытые):
 * — Rijk Zwaan, "Hydroponic Lettuce Assortment 2015" (PDF-каталог): тип, климатическая зона,
 *   устойчивость, рекомендации по сезону. files.tlhort.com/topicassets/attachments/ta_332
 * — Johnny's Selected Seeds, каталог Salanova® Hydroponic: DTM (days to maturity) 35–45 дн
 *   для гидропоники. johnnyseeds.com/vegetables/lettuce/salanova-lettuce
 * — Purdue Extension HO-310-W, "Performance of Lettuce Varieties in Greenhouse Hydroponic 
 *   Production" (2020): рейтинги сухой массы по 25 сортам в NFT/CFT, 40 дней цикл.
 *   extension.purdue.edu/extmedia/HO/HO-310-W.pdf
 * — UF/IFAS HS1258, "Overview of Lettuce Production Systems and Cultivars" (2018/обновл. 2025):
 *   типы и сорта для теплиц Флориды. edis.ifas.ufl.edu/publication/HS1258
 * — Beacham et al. (2019) Selection of Heat Tolerant Lettuce in DWC: жаростойкие романо
 *   (Parris Island, Jericho, Coastal Star) и батавия (Nevada, Sierra).
 * — Cornell CEA Lettuce Handbook (Brechner & Both, обновл. 2013): эталонные параметры
 *   для индора DLI 17 моль, цикл 35 дней. cpb-us-e1.wpmucdn.com/blogs.cornell.edu
 * — Vitalis/Enza Zaden hydroponic lettuce assortment (Fairly, Mirlo, Jara, Casey)
 * — Kelly et al. (2021) Plants 10(4):704 — PCS и LUE Salanova oakleaf vs мизуна на VF.
 * 
 * ОЦЕНКА ПАРАМЕТРОВ:
 * Параметры M_max, k, t50, ca являются оценочными и получены так:
 * — M_max: из паспортной "head size" селекционера (S<150г, M 150–300г, L>300г) или 
 *   из весов в trial-репортах, скорректированных к "товарной голове" (×1.1).
 * — t50: примерно DTM_seed − 10..12 дн (точка перегиба логистики обычно за ~10–14 дн
 *   до выхода на товарный вес при k ≈ 0.28–0.32).
 * — k: эмпирически 0.26 (медленные iceberg/grazion-типы) → 0.30 (стандарт) → 0.40 (быстрые лолло/беби).
 * — ca: по морфологии (мм/√г): butterhead 12–14, romaine 11–13, oakleaf 16–18, 
 *   batavia 14–16, lollo 13–15, salanova 13–16, iceberg 12, baby 9–11.
 * — t_opt: 20–21 °C для temperate-сортов, 23–25 °C для (sub)tropical-сортов.
 * — heatSigma/heatBolt: 60/1.9 (термочувствительные) → 150/0.7 (жаростойкие батавии).
 * 
 * ВАЖНО: эти значения — стартовая точка, не калибровка под твою ферму.
 * Сорта, отмеченные `calibrated: false` — теоретические оценки; калибровку под свои
 * условия — docs/LETTUCE_CULTIVARS_REFERENCE.md и лист Calibration Template в docs/lettuce-cultivars-reference.xlsx.
 */
(function(global){
  'use strict';

  // === БАТЕРХЕД (BUTTERHEAD / BIBB / BOSTON) ============================
  // Самый распространённый теплично-гидропонный тип. Компактная мягкая голова.
  // Цикл 32–45 дн, обычно 150–350 г/голова. Чувствительны к жаре и tip burn.
  var BUTTERHEAD = [
    { id:'rex',          name:'Rex (Рекс)',                 sub:'butterhead · стандарт CEA', breeder:'Rijk Zwaan', type:'butterhead', season:'year_round',
      M_max:180, k:0.32, t50:24, ca:13.0, bolt:42, multicut:false, heatSigma:75, heatBolt:1.4, t_opt:21, babyGreen:false,
      notes:'Промышленный эталон NFT/DWC, медленно болтится, устойчив к tipburn. Cornell, UF, Purdue trials.' },
    { id:'flandria',     name:'Flandria (Фландрия)',        sub:'butterhead glasshouse', breeder:'Rijk Zwaan', type:'butterhead', season:'spring_autumn',
      M_max:220, k:0.30, t50:26, ca:13.5, bolt:44, multicut:false, heatSigma:70, heatBolt:1.5, t_opt:20, babyGreen:false,
      notes:'Голландский стандарт стекла, "blond" цвет, медленный bolt, Bl:16,17,21,23.' },
    { id:'cosmopolia',   name:'Cosmopolia (Космополия)',    sub:'butterhead крупная', breeder:'Rijk Zwaan', type:'butterhead', season:'year_round',
      M_max:380, k:0.28, t50:30, ca:14.0, bolt:46, multicut:false, heatSigma:80, heatBolt:1.3, t_opt:21, babyGreen:false,
      notes:'Большая голова 400–550 г, для крупных живых форматов. Nasonovia-резистент.' },
    { id:'skyphos',      name:'Skyphos (Скайфос)',          sub:'butterhead красный', breeder:'Rijk Zwaan', type:'butterhead', season:'year_round',
      M_max:200, k:0.28, t50:27, ca:13.0, bolt:42, multicut:false, heatSigma:70, heatBolt:1.4, t_opt:21, babyGreen:false,
      notes:'Крупный красный, бордовая половина листа, зелёный центр. UF/IFAS флагман.' },
    { id:'tahamata',     name:'Tahamata (Тахамата)',        sub:'butterhead летний', breeder:'Rijk Zwaan', type:'butterhead', season:'summer',
      M_max:170, k:0.32, t50:23, ca:12.5, bolt:50, multicut:false, heatSigma:130, heatBolt:0.8, t_opt:24, babyGreen:false,
      notes:'Компактный летний, медленный bolt, Nasonovia. Для (sub)тропиков лето.' },
    { id:'jannica',      name:'Jannica (Янника)',           sub:'butterhead летний indoor', breeder:'Rijk Zwaan', type:'butterhead', season:'summer',
      M_max:180, k:0.30, t50:25, ca:12.5, bolt:50, multicut:false, heatSigma:120, heatBolt:0.9, t_opt:23, babyGreen:false,
      notes:'Tipburn-резистент, медленный bolt, чуть крупнее Tahamata.' },
    { id:'halewyn',      name:'Halewyn (Хелвин)',           sub:'butterhead зимний', breeder:'Rijk Zwaan', type:'butterhead', season:'autumn_winter',
      M_max:320, k:0.26, t50:32, ca:14.0, bolt:45, multicut:false, heatSigma:60, heatBolt:1.7, t_opt:18, babyGreen:false,
      notes:'Большая тяжёлая голова для отапливаемого зимнего стекла, 14 раст/м².' },
    { id:'sintia',       name:'Sintia (Синтия)',            sub:'butterhead summer glasshouse', breeder:'Rijk Zwaan', type:'butterhead', season:'summer',
      M_max:300, k:0.28, t50:28, ca:13.5, bolt:48, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:23, babyGreen:false,
      notes:'Стабильная форма головы летом, tipburn/bolt резистент.' },
    { id:'mirlo',        name:'Mirlo (Мирло)',              sub:'butterhead living NFT', breeder:'Vitalis/Enza Zaden', type:'butterhead', season:'year_round',
      M_max:200, k:0.30, t50:25, ca:13.0, bolt:42, multicut:false, heatSigma:75, heatBolt:1.4, t_opt:21, babyGreen:false,
      notes:'Topперформер в Purdue 2022 trial по живой батерхед.' },
    { id:'dynamite',     name:'Dynamite (Динамит)',         sub:'butterhead living NFT', breeder:'Vitalis/Enza Zaden', type:'butterhead', season:'year_round',
      M_max:200, k:0.30, t50:25, ca:13.0, bolt:42, multicut:false, heatSigma:75, heatBolt:1.4, t_opt:21, babyGreen:false,
      notes:'Topперформер в Purdue 2022, обходит Skyphos и Teodore.' },
    { id:'alkindus',     name:'Alkindus (Алькиндус)',       sub:'butterhead красный', breeder:'Rijk Zwaan', type:'butterhead', season:'year_round',
      M_max:200, k:0.30, t50:26, ca:13.0, bolt:42, multicut:false, heatSigma:80, heatBolt:1.3, t_opt:21, babyGreen:false,
      notes:'Лидер красного butterhead в Purdue HO-310-W (10.2 г/раст сух. вес).' },
    { id:'buttercrunch', name:'Buttercrunch (Баттеркранч)', sub:'butterhead open-pollinated', breeder:'OP standard', type:'butterhead', season:'year_round',
      M_max:170, k:0.32, t50:23, ca:12.5, bolt:38, multicut:false, heatSigma:85, heatBolt:1.2, t_opt:21, babyGreen:false,
      notes:'OP-классика, неплохо в гидропонике, но менее стабильна чем гибриды.' }
  ];

  // === РОМЭН / КОС (ROMAINE / COS) ======================================
  // Прямостоячая, плотная голова, цикл 32–45 дн, 200–400 г. Жаростойкие романо —
  // лучшие летние сорта в trials.
  var ROMAINE = [
    { id:'salvius',      name:'Salvius (Сальвиус)',         sub:'romaine green большая', breeder:'Rijk Zwaan', type:'romaine', season:'year_round',
      M_max:280, k:0.30, t50:28, ca:11.5, bolt:46, multicut:false, heatSigma:100, heatBolt:1.1, t_opt:22, babyGreen:false,
      notes:'#1 в Purdue romaine trial (18.6 г/раст сух. вес). Universal NFT/CFT.' },
    { id:'coastal-star', name:'Coastal Star (Костал Стар)', sub:'romaine жаростойкий', breeder:'Johnny\'s', type:'romaine', season:'year_round',
      M_max:300, k:0.28, t50:30, ca:11.5, bolt:50, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:24, babyGreen:false,
      notes:'Самый тёмно-зелёный romaine, термостойкий, тяжёлая голова. Beacham 2019.' },
    { id:'parris-island', name:'Parris Island Cos',          sub:'romaine standard', breeder:'OP standard', type:'romaine', season:'year_round',
      M_max:280, k:0.28, t50:30, ca:12.0, bolt:48, multicut:false, heatSigma:130, heatBolt:0.9, t_opt:23, babyGreen:false,
      notes:'OP-классика, выдерживает жару, эталон для бэби-микса.' },
    { id:'jericho',      name:'Jericho (Иерихон)',          sub:'romaine израильский жаростойкий', breeder:'Israeli/HighMowing', type:'romaine', season:'summer',
      M_max:300, k:0.28, t50:30, ca:12.0, bolt:55, multicut:false, heatSigma:150, heatBolt:0.7, t_opt:25, babyGreen:false,
      notes:'Топ жаростойкости (Beacham 2019), переносит >30°C без потери качества.' },
    { id:'green-forest', name:'Green Forest (Грин Форест)', sub:'romaine standard', breeder:'Johnny\'s', type:'romaine', season:'year_round',
      M_max:260, k:0.28, t50:29, ca:11.5, bolt:46, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:22, babyGreen:false,
      notes:'Лучший по tipburn/bolt в UF/IFAS, надёжен в гидропонике.' },
    { id:'counter',      name:'Counter (Каунтер)',          sub:'romaine быстрый', breeder:'Johnny\'s', type:'romaine', season:'year_round',
      M_max:220, k:0.32, t50:24, ca:11.5, bolt:42, multicut:false, heatSigma:100, heatBolt:1.1, t_opt:22, babyGreen:false,
      notes:'Очень быстрое созревание, термостойкий, подходит для частых ротаций.' },
    { id:'outredgeous',  name:'Outredgeous (Аутрэджес)',    sub:'romaine красный', breeder:'OP/Wild Garden', type:'romaine', season:'year_round',
      M_max:200, k:0.30, t50:26, ca:11.5, bolt:40, multicut:false, heatSigma:85, heatBolt:1.2, t_opt:21, babyGreen:false,
      notes:'NASA-сертифицирован, выращивался на МКС. Сохраняет цвет при низком свете.' },
    { id:'tiberius',     name:'Tiberius (Тиберий)',         sub:'romaine крупный зелёный', breeder:'Rijk Zwaan', type:'romaine', season:'year_round',
      M_max:340, k:0.28, t50:30, ca:11.5, bolt:46, multicut:false, heatSigma:90, heatBolt:1.2, t_opt:22, babyGreen:false,
      notes:'Большой romaine, прочный против tipburn. Fol:1.' },
    { id:'fusion',       name:'Fusion (Фьюжн)',             sub:'romaine winter NFT', breeder:'Johnny\'s', type:'romaine', season:'winter',
      M_max:250, k:0.28, t50:28, ca:11.5, bolt:44, multicut:false, heatSigma:80, heatBolt:1.3, t_opt:20, babyGreen:false,
      notes:'Top в Iowa hydroponic trial 2025 (winter-spring NFT в high tunnel).' },
    { id:'gladius',      name:'Gladius (Гладиус)',          sub:'romaine standard', breeder:'Johnny\'s', type:'romaine', season:'year_round',
      M_max:240, k:0.30, t50:27, ca:11.5, bolt:44, multicut:false, heatSigma:100, heatBolt:1.1, t_opt:22, babyGreen:false,
      notes:'Стабилен по сезонам, top в Iowa trial 2025.' }
  ];

  // === БАТАВИЯ (BATAVIA / FRENCH CRISP / SUMMER CRISP) =================
  // Между leaf и iceberg: рыхлая голова, хрустящие листья. Часто самые жаростойкие.
  var BATAVIA = [
    { id:'aficion-rz',   name:'Aficion RZ (Афицион)',       sub:'батавия RZ summer', breeder:'Rijk Zwaan', type:'batavia', season:'summer',
      M_max:240, k:0.28, t50:30, ca:14.5, bolt:48, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:25, babyGreen:false,
      notes:'Открытый тип, медленный bolt, аналог Grand Rapids. ИЗВЕСТНЫЙ температуростойкий.' },
    { id:'othilie',      name:'Othilie (Отилия)',           sub:'батавия green harvest-sure', breeder:'Rijk Zwaan', type:'batavia', season:'year_round',
      M_max:220, k:0.30, t50:28, ca:14.5, bolt:45, multicut:false, heatSigma:120, heatBolt:0.9, t_opt:23, babyGreen:false,
      notes:'Универсальная, против вытягивания в экстриме, для теплиц с/без LED.' },
    { id:'tourbillon',   name:'Tourbillon (Турбийон)',      sub:'батавия high yield', breeder:'Rijk Zwaan', type:'batavia', season:'year_round',
      M_max:260, k:0.28, t50:30, ca:14.5, bolt:46, multicut:false, heatSigma:130, heatBolt:0.8, t_opt:24, babyGreen:false,
      notes:'High-yielding, прочен к tipburn, медленный bolt.' },
    { id:'cherokee',     name:'Cherokee (Чероки)',          sub:'батавия красный summercrisp', breeder:'Johnny\'s', type:'batavia', season:'summer',
      M_max:240, k:0.30, t50:28, ca:14.0, bolt:46, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:24, babyGreen:false,
      notes:'Тёмно-бордовый, термостойкий, отличный вкус. UF/IFAS флагман.' },
    { id:'nevada',       name:'Nevada (Невада)',            sub:'батавия green summercrisp', breeder:'Johnny\'s', type:'batavia', season:'year_round',
      M_max:230, k:0.30, t50:27, ca:14.0, bolt:48, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:24, babyGreen:false,
      notes:'Лучший летний summercrisp, под притенением.' },
    { id:'concept',      name:'Concept (Концепт)',          sub:'батавия green winter', breeder:'Johnny\'s', type:'batavia', season:'winter',
      M_max:230, k:0.30, t50:27, ca:14.5, bolt:42, multicut:false, heatSigma:90, heatBolt:1.2, t_opt:20, babyGreen:false,
      notes:'Зимний summercrisp, отличный цвет и вкус в низкосветном цикле.' },
    { id:'sierra',       name:'Sierra (Сьерра)',            sub:'батавия красный жаростойкий', breeder:'Johnny\'s', type:'batavia', season:'summer',
      M_max:220, k:0.28, t50:28, ca:14.0, bolt:50, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:24, babyGreen:false,
      notes:'Жаростойкий красный, рекомендован Beacham 2019 для лета.' },
    { id:'starfighter',  name:'Starfighter RZ (Старфайтер)', sub:'батавия RZ пузырчатая', breeder:'Rijk Zwaan', type:'batavia', season:'year_round',
      M_max:280, k:0.26, t50:32, ca:14.0, bolt:47, multicut:false, heatSigma:150, heatBolt:0.7, t_opt:25, babyGreen:false,
      notes:'Топ Rijk Zwaan по жаростойкости, тяжёлая пузырчатая голова.' },
    { id:'grazion',      name:'Grazion RZ (Грейзион)',      sub:'батавия RZ тяжёлая', breeder:'Rijk Zwaan', type:'batavia', season:'year_round',
      M_max:320, k:0.30, t50:29, ca:15.0, bolt:46, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:25, babyGreen:false,
      notes:'Очень тяжёлая голова, для крупного формата.' },
    { id:'afilion-rz',   name:'Afilion RZ (Афилион)',       sub:'батавия RZ', breeder:'Rijk Zwaan', type:'batavia', season:'year_round',
      M_max:230, k:0.28, t50:30, ca:14.5, bolt:45, multicut:false, heatSigma:130, heatBolt:0.9, t_opt:25, babyGreen:false,
      notes:'Стандарт от RZ для индора, среднее звено линейки.' }
  ];

  // === ОАК-ЛИФ (OAKLEAF) ================================================
  // Раскидистый, листья формы дубового листа, без плотной головы. ca высокий из-за
  // раскидистости, n_canopy = 2 заниженный (можно увеличить ca или canopyExp до 0.55).
  var OAKLEAF = [
    { id:'navara',       name:'Navara (Навара)',            sub:'оакфил красный компактный', breeder:'Johnny\'s', type:'oakleaf', season:'year_round',
      M_max:200, k:0.30, t50:26, ca:17.5, bolt:40, multicut:true, heatSigma:80, heatBolt:1.3, t_opt:21, babyGreen:false, canopyExp:0.55,
      notes:'Компактный красный оакфил, медленный bolt. Purdue HO-310-W oakleaf #2.' },
    { id:'kitonia',      name:'Kitonia RZ (Китония)',       sub:'оакфил green compact', breeder:'Rijk Zwaan', type:'oakleaf', season:'year_round',
      M_max:200, k:0.30, t50:26, ca:17.0, bolt:42, multicut:true, heatSigma:120, heatBolt:0.9, t_opt:23, babyGreen:false, canopyExp:0.55,
      notes:'Прочна против elongation в экстриме, harvest-sure.' },
    { id:'kiribati',     name:'Kiribati RZ (Кирибати)',     sub:'оакфил быстрый летний', breeder:'Rijk Zwaan', type:'oakleaf', season:'summer',
      M_max:190, k:0.34, t50:22, ca:17.0, bolt:42, multicut:true, heatSigma:130, heatBolt:0.8, t_opt:24, babyGreen:false, canopyExp:0.55,
      notes:'Очень быстрый, против tipburn, для лета (sub)тропиков.' },
    { id:'rouxai',       name:'Rouxaï RZ (Ружэ)',           sub:'оакфил quatro red', breeder:'Rijk Zwaan', type:'oakleaf', season:'year_round',
      M_max:200, k:0.28, t50:28, ca:17.0, bolt:42, multicut:true, heatSigma:80, heatBolt:1.4, t_opt:21, babyGreen:false, canopyExp:0.55,
      notes:'Самый тёмно-красный, цвет и на нижней стороне. Премиум-цвет.' },
    { id:'panisse',      name:'Panisse (Панисс)',           sub:'оакфил green large', breeder:'Johnny\'s', type:'oakleaf', season:'year_round',
      M_max:230, k:0.30, t50:27, ca:18.0, bolt:42, multicut:true, heatSigma:90, heatBolt:1.2, t_opt:21, babyGreen:false, canopyExp:0.58,
      notes:'Крупный лаймовый оакфил, плотная голова для оакфила. UF/IFAS.' },
    { id:'oscarde',      name:'Oscarde (Оскар)',            sub:'оакфил dark red большой', breeder:'Johnny\'s', type:'oakleaf', season:'year_round',
      M_max:220, k:0.30, t50:27, ca:17.5, bolt:40, multicut:true, heatSigma:80, heatBolt:1.3, t_opt:21, babyGreen:false, canopyExp:0.55,
      notes:'Глубокий вишнёво-красный, сохраняет цвет в low light.' },
    { id:'mondai',       name:'Mondaï RZ (Мондай)',         sub:'оакфил dark red', breeder:'Rijk Zwaan', type:'oakleaf', season:'year_round',
      M_max:200, k:0.30, t50:26, ca:17.0, bolt:40, multicut:true, heatSigma:90, heatBolt:1.2, t_opt:22, babyGreen:false, canopyExp:0.55,
      notes:'Тёмно-красный, vigorous. LMV:1.' },
    { id:'cedar',        name:'Cedar (Седар)',              sub:'оакфил green', breeder:'Johnny\'s', type:'oakleaf', season:'year_round',
      M_max:200, k:0.30, t50:26, ca:17.0, bolt:42, multicut:true, heatSigma:90, heatBolt:1.2, t_opt:21, babyGreen:false, canopyExp:0.55,
      notes:'Зелёный оакфил, Purdue oakleaf #3.' }
  ];

  // === ЛОЛЛО (LOLLO ROSSA / BIONDA) =====================================
  // Кучерявый, плотный куст, рыхлая голова. ca среднее, M_max малый-средний.
  var LOLLO = [
    { id:'locarno',      name:'Locarno RZ (Локарно)',       sub:'лолло bionda быстрый', breeder:'Rijk Zwaan', type:'lollo', season:'year_round',
      M_max:170, k:0.34, t50:23, ca:14.0, bolt:40, multicut:true, heatSigma:90, heatBolt:1.2, t_opt:22, babyGreen:false,
      notes:'Быстрорастущий зелёный лолло, для всех сезонов.' },
    { id:'satine',       name:'Satine RZ (Сатин)',          sub:'лолло rossa indoor', breeder:'Rijk Zwaan', type:'lollo', season:'year_round',
      M_max:180, k:0.32, t50:25, ca:14.0, bolt:40, multicut:true, heatSigma:80, heatBolt:1.4, t_opt:21, babyGreen:false,
      notes:'Эталон indoor лолло россо, круглый год.' },
    { id:'carmesi',      name:'Carmesi RZ (Кармези)',       sub:'лолло rossa deep red', breeder:'Rijk Zwaan', type:'lollo', season:'year_round',
      M_max:200, k:0.32, t50:25, ca:14.5, bolt:42, multicut:true, heatSigma:90, heatBolt:1.2, t_opt:22, babyGreen:false,
      notes:'Глубокий красный, медленный bolt, strong vigour. Fol:1 Nr:0.' },
    { id:'carmoli',      name:'Carmolí RZ (Кармоли)',       sub:'лолло triple red open', breeder:'Rijk Zwaan', type:'lollo', season:'year_round',
      M_max:190, k:0.32, t50:25, ca:14.5, bolt:42, multicut:true, heatSigma:90, heatBolt:1.2, t_opt:22, babyGreen:false,
      notes:'Триплет-красный, открытый тип — свет в центр, vigorous.' },
    { id:'amandine',     name:'Amandine RZ (Амандин)',      sub:'лолло rossa', breeder:'Rijk Zwaan', type:'lollo', season:'year_round',
      M_max:170, k:0.32, t50:25, ca:13.5, bolt:40, multicut:true, heatSigma:80, heatBolt:1.4, t_opt:21, babyGreen:false,
      notes:'Стандартный indoor лолло россо.' },
    { id:'corentine',    name:'Corentine RZ (Корентина)',   sub:'лолло rossa крупный', breeder:'Rijk Zwaan', type:'lollo', season:'autumn_winter',
      M_max:220, k:0.30, t50:27, ca:14.5, bolt:42, multicut:true, heatSigma:80, heatBolt:1.4, t_opt:20, babyGreen:false,
      notes:'Крупнее Satine, толще лист, осенне-зимний.' },
    { id:'mercato',      name:'Mercato RZ (Меркато)',       sub:'лолло bionda low crop', breeder:'Rijk Zwaan', type:'lollo', season:'autumn_winter',
      M_max:160, k:0.32, t50:24, ca:13.5, bolt:38, multicut:true, heatSigma:75, heatBolt:1.5, t_opt:20, babyGreen:false,
      notes:'Низкорослый для зимнего LED-цикла.' },
    { id:'dark-lollo-rossa', name:'Dark Lollo Rossa (Дарк Лолло)', sub:'лолло rossa cветостабильный', breeder:'Johnny\'s/Bejo', type:'lollo', season:'year_round',
      M_max:180, k:0.32, t50:25, ca:14.0, bolt:38, multicut:true, heatSigma:85, heatBolt:1.3, t_opt:21, babyGreen:false,
      notes:'Хороший цвет даже под низким DLI.' }
  ];

  // === LEAF / LOOSE LEAF (без головы) ===================================
  // Рыхлый куст, лист используется поштучно или для микса.
  var LEAF = [
    { id:'red-sails',    name:'Red Sails (Ред Сэйлс)',      sub:'leaf красный frilly', breeder:'OP standard', type:'leaf', season:'year_round',
      M_max:220, k:0.32, t50:25, ca:15.0, bolt:40, multicut:true, heatSigma:100, heatBolt:1.1, t_opt:22, babyGreen:false,
      notes:'#1 в Purdue HO-310-W leaf trial (16.2 г сух/раст). Тяжёлая frilly голова.' },
    { id:'walkmann',     name:'Walkmann\'s Dark Green',     sub:'leaf тёмно-зелёный', breeder:'OP', type:'leaf', season:'year_round',
      M_max:200, k:0.32, t50:25, ca:14.5, bolt:38, multicut:true, heatSigma:90, heatBolt:1.2, t_opt:21, babyGreen:false,
      notes:'Purdue leaf #2 (14.0 г сух).' },
    { id:'black-seeded-simpson', name:'Black Seeded Simpson', sub:'leaf зелёный быстрый', breeder:'OP heritage', type:'leaf', season:'spring_autumn',
      M_max:170, k:0.36, t50:21, ca:14.0, bolt:32, multicut:true, heatSigma:80, heatBolt:1.5, t_opt:20, babyGreen:false,
      notes:'OP-классика 1850-х, очень быстрый, но болтливый летом.' },
    { id:'new-red-fire', name:'New Red Fire',                sub:'leaf красный frilly', breeder:'Johnny\'s', type:'leaf', season:'year_round',
      M_max:200, k:0.32, t50:25, ca:14.5, bolt:42, multicut:true, heatSigma:110, heatBolt:1.0, t_opt:22, babyGreen:false,
      notes:'Жаростойкий, тяжёлая голова с frilly листом.' },
    { id:'tropicana',    name:'Tropicana (Тропикана)',      sub:'leaf зелёный жаростойкий', breeder:'Multi', type:'leaf', season:'summer',
      M_max:210, k:0.32, t50:25, ca:14.5, bolt:46, multicut:true, heatSigma:130, heatBolt:0.9, t_opt:24, babyGreen:false,
      notes:'Жаростойкий зелёный, медленный bolt, использовался в Peru NFT trial.' }
  ];

  // === САЛАНОВА (ONE-CUT MULTILEAF) =====================================
  // Срезаешь у основания → распадается на ~70 одинаковых "молодых" листочков.
  // DTM 35–45 дн (Johnny's). По форме листа: butter / batavia / oakleaf / crispy / lollo.
  // Для салановы canopyExp лучше 0.55 — рыхлая многолистная архитектура.
  var SALANOVA = [
    { id:'sl-aquino',    name:'Salanova Aquino (Акино)',    sub:'Salanova Butter Green крупная', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_butter', season:'year_round',
      M_max:200, k:0.30, t50:27, ca:14.0, bolt:42, multicut:false, heatSigma:130, heatBolt:0.8, t_opt:24, babyGreen:false, canopyExp:0.55,
      notes:'Topсаланова butter green, стабильна в жаре. DTM 40–45 дн.' },
    { id:'sl-descartes', name:'Salanova Descartes (Декарт)', sub:'Salanova Butter Green many leaves', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_butter', season:'year_round',
      M_max:180, k:0.30, t50:26, ca:13.5, bolt:42, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:22, babyGreen:false, canopyExp:0.55,
      notes:'Много мелких листочков, нежный вкус, plate-presentation.' },
    { id:'sl-pascal',    name:'Salanova Pascal (Паскаль)',  sub:'Salanova Butter Dark Green', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_butter', season:'year_round',
      M_max:190, k:0.30, t50:27, ca:13.5, bolt:42, multicut:false, heatSigma:120, heatBolt:0.9, t_opt:23, babyGreen:false, canopyExp:0.55,
      notes:'Тёмный, прочный против haloing.' },
    { id:'sl-gaugin',    name:'Salanova Gaugin (Гоген)',    sub:'Salanova Butter Red contrast', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_butter', season:'year_round',
      M_max:170, k:0.30, t50:26, ca:14.0, bolt:40, multicut:false, heatSigma:100, heatBolt:1.1, t_opt:22, babyGreen:false, canopyExp:0.55,
      notes:'Жёлто-зелёно-красный контраст, мелкие листья, fresh flavor.' },
    { id:'sl-klee',      name:'Salanova Klee (Клее)',       sub:'Salanova Butter Red large', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_butter', season:'year_round',
      M_max:200, k:0.30, t50:27, ca:14.0, bolt:42, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:23, babyGreen:false, canopyExp:0.55,
      notes:'Крупнее Gaugin, против двойного сердца. Nr:0.' },
    { id:'sl-cook',      name:'Salanova Cook (Кук)',        sub:'Salanova Oak Green', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_oak', season:'year_round',
      M_max:180, k:0.30, t50:26, ca:16.5, bolt:42, multicut:false, heatSigma:100, heatBolt:1.1, t_opt:22, babyGreen:false, canopyExp:0.58,
      notes:'Самый ходовой Oak Green Salanova, attractive firm head.' },
    { id:'sl-xandra',    name:'Salanova Xandra (Ксандра)',  sub:'Salanova Oak Red vigorous', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_oak', season:'year_round',
      M_max:200, k:0.32, t50:25, ca:16.5, bolt:42, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:22, babyGreen:false, canopyExp:0.58,
      notes:'Глубокий красный, vigorous. Nr:0.' },
    { id:'sl-humboldt',  name:'Salanova Humboldt (Гумбольдт)', sub:'Salanova Oak Green глянцевый', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_oak', season:'year_round',
      M_max:200, k:0.30, t50:27, ca:17.0, bolt:42, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:22, babyGreen:false, canopyExp:0.58,
      notes:'Vertical-orient, для VF удобен. Чуть больше Cook.' },
    { id:'sl-yacht',     name:'Salanova Yacht (Яхт)',       sub:'Salanova Batavia Green быстрый', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_batavia', season:'year_round',
      M_max:190, k:0.34, t50:24, ca:15.0, bolt:42, multicut:false, heatSigma:120, heatBolt:0.9, t_opt:23, babyGreen:false, canopyExp:0.55,
      notes:'Самый быстрый Salanova batavia. Nr:0 LMV:1.' },
    { id:'sl-exact',     name:'Salanova Exact (Экзакт)',    sub:'Salanova Crispy Green', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_crispy', season:'year_round',
      M_max:200, k:0.30, t50:27, ca:15.0, bolt:42, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:22, babyGreen:false, canopyExp:0.55,
      notes:'Хрустящий, frilled, отличный shelf life. Используется в Wageningen VF trials.' },
    { id:'sl-expertise', name:'Salanova Expertise (Экспертиз)', sub:'Salanova Crispy Green tipburn-strong', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_crispy', season:'year_round',
      M_max:200, k:0.30, t50:27, ca:15.0, bolt:44, multicut:false, heatSigma:130, heatBolt:0.8, t_opt:23, babyGreen:false, canopyExp:0.55,
      notes:'Очень прочный к tipburn и bolt. Эталон CEA в исследованиях Wageningen.' },
    { id:'sl-triplex',   name:'Salanova Triplex (Триплекс)', sub:'Salanova Crispy Red', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_crispy', season:'year_round',
      M_max:190, k:0.30, t50:27, ca:15.0, bolt:40, multicut:false, heatSigma:90, heatBolt:1.2, t_opt:22, babyGreen:false, canopyExp:0.55,
      notes:'Красный crispy, frilled. Хороший shelf life.' },
    { id:'sl-hexagon',   name:'Salanova Hexagon (Гексагон)', sub:'Salanova Crispy Red 3D', breeder:'Rijk Zwaan / Johnny\'s', type:'salanova_crispy', season:'year_round',
      M_max:180, k:0.30, t50:26, ca:15.0, bolt:40, multicut:false, heatSigma:90, heatBolt:1.2, t_opt:22, babyGreen:false, canopyExp:0.55,
      notes:'3D-структура, tender flavor. Salanova Lollo Red.' }
  ];

  // === MINI / LITTLE GEM ================================================
  // Маленький romaine, цикл 32–40 дн, 80–150 г.
  var MINI = [
    { id:'bambi',        name:'Bambi RZ (Бэмби)',           sub:'mini-cos compact', breeder:'Rijk Zwaan', type:'mini_romaine', season:'year_round',
      M_max:130, k:0.36, t50:21, ca:11.5, bolt:42, multicut:false, heatSigma:120, heatBolt:0.9, t_opt:23, babyGreen:false,
      notes:'Короче и более uniform чем Little Gem, sweet taste.' },
    { id:'thumper',      name:'Thumper (Тампер)',           sub:'mini-romaine green', breeder:'Johnny\'s', type:'mini_romaine', season:'year_round',
      M_max:130, k:0.36, t50:21, ca:11.5, bolt:46, multicut:false, heatSigma:120, heatBolt:0.9, t_opt:22, babyGreen:false,
      notes:'Очень медленный bolt, против tipburn. UF/IFAS.' },
    { id:'astorga',      name:'Astorga RZ (Асторга)',       sub:'Little Gem slow bolt', breeder:'Rijk Zwaan', type:'mini_romaine', season:'year_round',
      M_max:120, k:0.36, t50:20, ca:11.0, bolt:48, multicut:false, heatSigma:130, heatBolt:0.8, t_opt:23, babyGreen:false,
      notes:'Самый bolt-резистент Little Gem от RZ.' },
    { id:'baeza',        name:'Baeza RZ (Баеза)',           sub:'Little Gem tipburn-strong', breeder:'Rijk Zwaan', type:'mini_romaine', season:'year_round',
      M_max:120, k:0.36, t50:20, ca:11.0, bolt:46, multicut:false, heatSigma:130, heatBolt:0.8, t_opt:23, babyGreen:false,
      notes:'Прочен к tipburn, медленный bolt.' }
  ];

  // === ICEBERG / CRISPHEAD ==============================================
  // Плотная хрустящая голова, цикл 45–60 дн, 400–700 г. Реже в гидропонике.
  var ICEBERG = [
    { id:'bruma',        name:'Bruma RZ (Брума)',           sub:'iceberg slow bolt', breeder:'Rijk Zwaan', type:'iceberg', season:'summer',
      M_max:450, k:0.24, t50:38, ca:12.0, bolt:55, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:24, babyGreen:false,
      notes:'Жаростойкая, хорошая форма в жаре, против tipburn.' },
    { id:'platinas',     name:'Platinas RZ (Платинас)',     sub:'iceberg fast', breeder:'Rijk Zwaan', type:'iceberg', season:'year_round',
      M_max:480, k:0.26, t50:36, ca:12.0, bolt:50, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:22, babyGreen:false,
      notes:'Надёжный, быстрорастущий, против tipburn. Nr:0/Pb.' },
    { id:'morinas',      name:'Morinas RZ (Моринас)',       sub:'iceberg слабо болтится', breeder:'Rijk Zwaan', type:'iceberg', season:'year_round',
      M_max:500, k:0.26, t50:37, ca:12.0, bolt:50, multicut:false, heatSigma:100, heatBolt:1.1, t_opt:22, babyGreen:false,
      notes:'Хорошая heading, быстрое заполнение головы.' },
    { id:'happinas',     name:'Happinas RZ (Хаппинас)',     sub:'iceberg Nasonovia-Def', breeder:'Rijk Zwaan', type:'iceberg', season:'year_round',
      M_max:500, k:0.26, t50:37, ca:12.0, bolt:48, multicut:false, heatSigma:110, heatBolt:1.0, t_opt:22, babyGreen:false,
      notes:'Революция RZ — Nasonovia Defense, без обработок от тли.' }
  ];

  // === БЭБИ / МНОГОСРЕЗ (BABY LEAF / MULTI-CUT) ========================
  // 14–20 дн, 15–30 г/срез. Многократная срезка с одного куста.
  // Эти сорта во многом дублируют существующие в gh-cultivars.js — оставлены
  // для альтернатив и проверки.
  var BABY_LEAF = [
    { id:'baby-cos',     name:'Baby Cos (Бэби-кос)',        sub:'baby romaine', breeder:'Multi', type:'baby_romaine', season:'year_round',
      M_max:60, k:0.42, t50:14, ca:10.0, bolt:32, multicut:true, heatSigma:100, heatBolt:1.1, t_opt:22, babyGreen:true,
      notes:'Wicharuck 2024: 85–125 г/раст в теплице Чианг Май, DTM 28 дн от пересадки.' },
    { id:'green-oak-baby', name:'Green Oak Baby',           sub:'baby oakleaf', breeder:'Multi', type:'baby_oakleaf', season:'year_round',
      M_max:100, k:0.40, t50:16, ca:10.5, bolt:35, multicut:true, heatSigma:95, heatBolt:1.1, t_opt:22, babyGreen:true, canopyExp:0.55,
      notes:'Wicharuck 2024: 97–204 г/раст. Растёт быстрее baby cos.' },
    { id:'red-salad-bowl', name:'Red Salad Bowl',           sub:'leaf красный multicut', breeder:'OP', type:'leaf', season:'year_round',
      M_max:160, k:0.34, t50:22, ca:13.5, bolt:36, multicut:true, heatSigma:85, heatBolt:1.3, t_opt:21, babyGreen:false,
      notes:'OP-классика, многосрезный красный листовой.' }
  ];

  // === Регистрация в DG_GH_CULTIVARS =====================================
  // Аддитивная инжекция: добавляем все эти сорта в существующий каталог,
  // не трогая стартовые из gh-cultivars.js. Дубликаты по id игнорируются.
  var ALL_EXTENDED = []
    .concat(BUTTERHEAD)
    .concat(ROMAINE)
    .concat(BATAVIA)
    .concat(OAKLEAF)
    .concat(LOLLO)
    .concat(LEAF)
    .concat(SALANOVA)
    .concat(MINI)
    .concat(ICEBERG)
    .concat(BABY_LEAF);

  // Помечаем всё как калибровка-теоретическая
  ALL_EXTENDED.forEach(function(cv){
    if (cv.calibrated == null) cv.calibrated = false;
    if (cv.canopyExp == null) cv.canopyExp = 0.5;  // дефолт = текущая формула d=ca·√M
  });

  function injectExtended() {
    if (!global.DG_GH_CULTIVARS) {
      global.DG_GH_CULTIVARS = [];
    }
    var existingIds = {};
    global.DG_GH_CULTIVARS.forEach(function(c){ existingIds[c.id] = true; });
    ALL_EXTENDED.forEach(function(cv){
      if (!existingIds[cv.id]) {
        global.DG_GH_CULTIVARS.push(cv);
      }
    });
  }

  // Авто-инжект при подключении
  if (typeof global.DG_GH_CULTIVARS !== 'undefined') {
    injectExtended();
  } else {
    // Если этот файл подключён раньше gh-cultivars.js — отложить
    var prevHook = global.DG_onCultivarsReady;
    global.DG_onCultivarsReady = function(){
      injectExtended();
      if (typeof prevHook === 'function') prevHook();
    };
  }

  // Экспорт для отладки и для калибровочного инструмента
  global.DG_LETTUCE_EXTENDED = {
    butterhead: BUTTERHEAD,
    romaine: ROMAINE,
    batavia: BATAVIA,
    oakleaf: OAKLEAF,
    lollo: LOLLO,
    leaf: LEAF,
    salanova: SALANOVA,
    mini: MINI,
    iceberg: ICEBERG,
    baby_leaf: BABY_LEAF,
    all: ALL_EXTENDED,
    inject: injectExtended
  };
})(typeof window !== 'undefined' ? window : globalThis);
