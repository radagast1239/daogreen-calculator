/** Интерактивный гайд по калькулятору */
(function(global){
  'use strict';

  var STORAGE_KEY = 'daogreen-tour-done-v1';

  var STEPS = [
    { title: 'Добро пожаловать', body: 'Калькулятор Daogreen: посадка (каналы, поддоны, VF), экономика фермы, PDF и сохранение проекта. Запускайте через start-server.bat или по ссылке на хостинге — не двойным кликом по HTML.', target: null },
    { title: 'Вкладки', body: 'Четыре раздела: посадка (каналы и поддоны), «Экономика» и «Справочник стандартов» — сводная таблица урожайности, дней роста и плотности по всем культурам.', target: '#app-tabs' },
    { title: 'Сохранение проекта', body: '«Сохранить» — в браузер. «JSON» — файл для коллеги или сравнения. «Импорт» — загрузить проект. «Сравнить» — два JSON рядом.', target: '.masthead-actions' },
    { title: 'PDF', body: 'Выгрузка отчёта: выберите разделы (посадка, экономика, сценарии). Таблицы экономики — векторные, чёткие при печати.', target: '#btn-export-pdf' },
    { title: 'Теплица / VF', body: 'Режим объекта: теплица (каналы 110×55) или вертикальная ферма. Меняет доступные сорта и стандарты.', target: '#facility-env-wrap' },
    { title: 'Сорт', body: 'Выберите культуру в сетке кнопок — расчёт обновится сразу. На вкладке «Поддоны» — только сорта листа поддонов. Свой сорт: «+ Добавить». Для VF на каналах — переключите объект на «Вертикальная ферма».', target: '#panel-cultivars' },
    { title: 'Ползунки', body: 'Слева — название, посередине ползунок, справа значение. Кнопка «стандарт» (VF) подставляет значения из справочника.', target: '#panel-culture' },
    { title: 'Показатели', body: 'Масса, шапка, плотность, растения — пересчитываются при каждом изменении. Зелёные карточки — ключевые итоги.', target: '#panel-metrics' },
    { title: 'Схема', body: 'Вид сверху: шапки растений и занятость площади. Полезно для плотности посадки.', target: '#panel-schema' },
    { title: 'Мост в экономику', body: 'Из посадки: «Открыть экономику» или «Импорт из посадки» — перенос урожая и площади. Экономика считается отдельно, сорт в посадке не меняет цифры автоматически.', target: '#planting-econ-bridge' },
    { title: 'Экономика — импорт', body: '«Импорт из посадки» подставляет урожай и площади. Дальше правьте культуры, доли % или м², цены.', target: '#econ-sync-planting' },
    { title: 'Культуры и доли', body: 'До 6 культур. Сумма долей ≤ 100%. У каждой — цена, урожай за срезку, свет (кВт·ч/м²).', target: '#econ-panel-cultures' },
    { title: 'Итог и сценарии', body: '«Итог» — маржа и затраты. «Что если» — цена ±10%, урожай −15% и свои сценарии. Окупаемость — cash-flow и срок окупаемости CAPEX.', target: '#econ-panel-results' },
    { title: 'Расширения', body: 'Сезонность (12 мес), несколько площадок, цены по каналам сбыта, рост затрат по годам — блок ниже на вкладке экономики.', target: '#econ-panel-advanced' },
    { title: 'Установка на телефон', body: 'Кнопка «QR» в шапке — ссылка для установки PWA (нужен HTTPS на хостинге).', target: '#btn-pwa-qr' },
    { title: 'Готово', body: 'Плашка внизу справа — номер сборки. После обновлений: npm run build и Ctrl+F5. Гайд можно открыть снова кнопкой «Гайд».', target: null }
  ];

  var overlay, pop, stepIdx;

  function ensureUi(){
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'tour-overlay';
    overlay.innerHTML = '<div class="tour-backdrop"></div><div class="tour-pop" role="dialog" aria-live="polite">' +
      '<h3 class="tour-title"></h3><p class="tour-body"></p>' +
      '<p class="tour-progress"></p>' +
      '<div class="tour-actions">' +
      '<button type="button" class="auto-btn" id="tour-skip"></button>' +
      '<button type="button" class="auto-btn" id="tour-prev"></button>' +
      '<button type="button" class="auto-btn auto-btn--primary" id="tour-next"></button>' +
      '</div></div>';
    document.body.appendChild(overlay);
    pop = overlay.querySelector('.tour-pop');
    overlay.querySelector('#tour-skip').addEventListener('click', endTour);
    overlay.querySelector('#tour-prev').addEventListener('click', function(){ go(stepIdx - 1); });
    overlay.querySelector('#tour-next').addEventListener('click', function(){
      if (stepIdx >= getSteps().length - 1) endTour(true);
      else go(stepIdx + 1);
    });
    overlay.querySelector('.tour-backdrop').addEventListener('click', endTour);
  }

  function clearHighlight(){
    document.querySelectorAll('.tour-highlight').forEach(function(el){
      el.classList.remove('tour-highlight');
    });
  }

  function getSteps(){
    return global.DG_getTourSteps ? global.DG_getTourSteps() : STEPS;
  }

  function go(i){
    var steps = getSteps();
    stepIdx = Math.max(0, Math.min(steps.length - 1, i));
    var s = steps[stepIdx];
    ensureUi();
    clearHighlight();
    overlay.style.display = 'block';
    pop.querySelector('.tour-title').textContent = s.title;
    pop.querySelector('.tour-body').textContent = s.body;
    var stepLbl = global.DG_t ? global.DG_t('tour.step') : 'Шаг';
    var doneLbl = global.DG_t ? global.DG_t('tour.done') : 'Готово';
    var nextLbl = global.DG_t ? global.DG_t('tour.next') : 'Далее';
    var skipLbl = global.DG_t ? global.DG_t('tour.skip') : 'Пропустить';
    var backLbl = global.DG_t ? global.DG_t('tour.back') : 'Назад';
    pop.querySelector('.tour-progress').textContent = stepLbl + ' ' + (stepIdx + 1) + ' / ' + steps.length;
    overlay.querySelector('#tour-skip').textContent = skipLbl;
    overlay.querySelector('#tour-prev').textContent = backLbl;
    overlay.querySelector('#tour-prev').disabled = stepIdx === 0;
    overlay.querySelector('#tour-next').textContent = stepIdx >= steps.length - 1 ? doneLbl : nextLbl;

    var useCenter = !s.target || window.innerWidth < 768;
    pop.classList.toggle('tour-pop--center', useCenter);
    pop.classList.toggle('tour-pop--anchored', !useCenter);
    if (s.target){
      var el = document.querySelector(s.target);
      if (el){
        el.classList.add('tour-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!useCenter){
          var r = el.getBoundingClientRect();
          pop.style.position = 'fixed';
          var top = r.bottom + 12;
          if (top + 200 > window.innerHeight) top = Math.max(12, r.top - 200);
          pop.style.top = top + 'px';
          pop.style.left = Math.min(Math.max(12, r.left), window.innerWidth - pop.offsetWidth - 12) + 'px';
          pop.style.transform = '';
        }
      }
    }
    if (useCenter){
      pop.style.position = 'fixed';
      pop.style.top = '50%';
      pop.style.left = '50%';
      pop.style.right = 'auto';
      pop.style.transform = 'translate(-50%, -50%)';
    }
  }

  function endTour(done){
    overlay.style.display = 'none';
    clearHighlight();
    if (done) try { localStorage.setItem(STORAGE_KEY, '1'); } catch(_){}
  }

  function startTour(force){
    if (document.documentElement.classList.contains('auth-locked')) return;
    if (global.DG_isPreviewMode && global.DG_isPreviewMode()) return;
    if (global.DG_isAppAuthed && !global.DG_isAppAuthed()) return;
    if (!force){
      try { if (localStorage.getItem(STORAGE_KEY) === '1') return; } catch(_){}
    }
    go(0);
  }

  function initOnboardingTour(){
    var btn = document.getElementById('btn-tour');
    if (btn && !btn.dataset.bound){
      btn.dataset.bound = '1';
      btn.addEventListener('click', function(){ startTour(true); });
    }
    if (location.search.indexOf('tour=1') >= 0) startTour(true);
    else {
      setTimeout(function(){ startTour(false); }, 800);
      global.addEventListener('daogreen-auth-ok', function onAuth(){
        global.removeEventListener('daogreen-auth-ok', onAuth);
        setTimeout(function(){ startTour(false); }, 400);
      });
    }
  }

  global.DG_initOnboardingTour = initOnboardingTour;
  global.DG_startTour = function(){ startTour(true); };
})(typeof window !== 'undefined' ? window : this);
