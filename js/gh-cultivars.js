/** Сорта теплицы (CULTIVARS) — только справочник */
(function(global){
'use strict';
  global.DG_GH_CULTIVARS = [
    { id:'rucola',      name:'Руккола',            sub:'быстрый, многосрез',     M_max:120, k:0.40, t50:22, ca:13.0, bolt:35, multicut:true,  heatSigma:90,  heatBolt:1.3, t_opt:22, babyGreen:false },
    { id:'lollo',       name:'Лолло Россо/Бионда', sub:'компактный',             M_max:180, k:0.32, t50:27, ca:14.0, bolt:37, multicut:true,  heatSigma:60,  heatBolt:1.9, t_opt:21, babyGreen:false },
    { id:'romaine',     name:'Ромэн / Little Gem', sub:'упрощённый узкий',       M_max:200, k:0.28, t50:30, ca:11.5, bolt:42, multicut:false, heatSigma:75,  heatBolt:1.5, t_opt:21, babyGreen:false },
    { id:'oakleaf',     name:'Оаклиф',             sub:'раскидистый',            M_max:220, k:0.28, t50:31, ca:17.5, bolt:40, multicut:true,  heatSigma:65,  heatBolt:1.7, t_opt:21, babyGreen:false },
    { id:'frillice',    name:'Фриллис / Crispino', sub:'крупный плотный',        M_max:260, k:0.26, t50:33, ca:14.5, bolt:44, multicut:false, heatSigma:85,  heatBolt:1.4, t_opt:23, babyGreen:false },
    { id:'salanova',    name:'Саланова',           sub:'многолистный',           M_max:200, k:0.32, t50:28, ca:15.0, bolt:38, multicut:true,  heatSigma:65,  heatBolt:1.7, t_opt:21, babyGreen:false },
    { id:'aficion',     name:'Афицион',            sub:'батавия RZ, жаростойкая', M_max:230, k:0.28, t50:32, ca:14.5, bolt:46, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:25, babyGreen:false },
    { id:'afilion',     name:'Афилион',            sub:'батавия RZ',              M_max:210, k:0.28, t50:32, ca:14.5, bolt:45, multicut:false, heatSigma:130, heatBolt:0.9, t_opt:25, babyGreen:false },
    { id:'starfighter', name:'Старфайтер',         sub:'батавия RZ, пузырчатая',  M_max:250, k:0.26, t50:34, ca:14.0, bolt:47, multicut:false, heatSigma:150, heatBolt:0.7, t_opt:25, babyGreen:false },
    { id:'grazion',     name:'Грейзион',           sub:'батавия RZ, тяжёлая',     M_max:290, k:0.30, t50:31, ca:15.0, bolt:46, multicut:false, heatSigma:140, heatBolt:0.8, t_opt:25, babyGreen:false },
    { id:'basil',       name:'Базилик',            sub:'взрослый куст',          M_max:140, k:0.35, t50:28, ca:11.0, bolt:52, multicut:true,  heatSigma:85,  heatBolt:0.9, t_opt:24, babyGreen:false },
    { id:'lettuce-baby',name:'Салат беби',         sub:'стаканы D6 · 2 ряда шахм.', M_max:48, k:0.46, t50:14, ca:10.0, bolt:40, multicut:true,  heatSigma:65,  heatBolt:1.4, t_opt:20, babyGreen:true, cutIntervalStd:'8-18' },
    { id:'rucola-baby', name:'Руккола беби',       sub:'стаканы D6 · 2 ряда шахм.', M_max:36, k:0.50, t50:11, ca:9.0,  bolt:35, multicut:true,  heatSigma:88,  heatBolt:1.2, t_opt:22, babyGreen:true, cutIntervalStd:'8-18' },
    { id:'mizuna',      name:'Мизуна',             sub:'беби-зелень',            M_max:75,  k:0.46, t50:16, ca:9.5,  bolt:42, multicut:true,  heatSigma:70,  heatBolt:1.2, t_opt:20, babyGreen:true },
    { id:'kale',        name:'Кейл (кале)',        sub:'молодые листья',         M_max:95,  k:0.40, t50:19, ca:10.5, bolt:48, multicut:true,  heatSigma:75,  heatBolt:1.1, t_opt:19, babyGreen:true },
    { id:'chard',       name:'Мангольд',           sub:'листовой срез',          M_max:90,  k:0.36, t50:21, ca:11.0, bolt:50, multicut:true,  heatSigma:80,  heatBolt:1.0, t_opt:21, babyGreen:true },
    { id:'spinach',     name:'Шпинат',             sub:'быстрый лист',           M_max:65,  k:0.44, t50:15, ca:8.5,  bolt:36, multicut:true,  heatSigma:55,  heatBolt:1.4, t_opt:18, babyGreen:true },
    { id:'pakchoi',     name:'Пак-чой',            sub:'беби, компактный',        M_max:100, k:0.38, t50:20, ca:10.0, bolt:45, multicut:false, heatSigma:70,  heatBolt:1.2, t_opt:21, babyGreen:true }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
