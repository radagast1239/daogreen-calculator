/** Сохранение / загрузка проекта (JSON) — DG_initProjectStore */
(function(global){
  'use strict';

  var PROJECT_VERSION = 1;
  var STORAGE_KEY = 'daogreen-calc-project-v1';
  var RECENT_KEY = 'daogreen-calc-recent-v1';
  var ARCHIVE_KEY = 'daogreen-calc-archive-v1';
  var RECENT_MAX = 5;
  var ARCHIVE_MAX = 1000;

  function initProjectStore(deps){
    var fileInput = null;

    function T(k){ return (global.DG_t && global.DG_t(k)) || k; }
    function TF(k, vars){
      if (global.DG_tFmt) return global.DG_tFmt(k, vars);
      var s = T(k);
      if (vars) Object.keys(vars).forEach(function(vk){ s = s.replace(new RegExp('\\{' + vk + '\\}', 'g'), String(vars[vk])); });
      return s;
    }

    function snapshot(){
      return {
        v: PROJECT_VERSION,
        build: deps.getBuild ? deps.getBuild() : '',
        exportedAt: new Date().toISOString(),
        state: deps.getState()
      };
    }

    function projectLabelFromSnap(snap){
      if (!snap || !snap.state) return T('proj.recent.unnamed');
      var st = snap.state;
      var client = String(st.projectClient || '').trim();
      var city = String(st.projectCity || '').trim();
      var title = String(st.projectTitle || '').trim();
      if (client && city && title) return client + ' · ' + city + ' · ' + title;
      if (client && title) return client + ' · ' + title;
      if (city && title) return city + ' · ' + title;
      if (client && city) return client + ' · ' + city;
      if (client) return client;
      if (title) return title;
      if (deps.getProjectLabel) return deps.getProjectLabel(st);
      if (deps.getCvName) return deps.getCvName();
      return T('proj.recent.unnamed');
    }

    function readRecent(){
      try {
        var raw = localStorage.getItem(RECENT_KEY);
        if (!raw) return [];
        var list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
      } catch (e){
        return [];
      }
    }

    function writeRecent(list){
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
      } catch (e){ /* quota */ }
    }

    function readArchive(){
      try {
        var raw = localStorage.getItem(ARCHIVE_KEY);
        if (!raw) return [];
        var list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
      } catch (e){
        return [];
      }
    }

    function writeArchive(list){
      var work = Array.isArray(list) ? list.slice(-ARCHIVE_MAX) : [];
      while (work.length){
        try {
          localStorage.setItem(ARCHIVE_KEY, JSON.stringify(work));
          return work.length;
        } catch (e){
          work.shift();
        }
      }
      try {
        localStorage.setItem(ARCHIVE_KEY, '[]');
      } catch (e2){ /* quota */ }
      return 0;
    }

    function pushRecent(snap){
      var label = projectLabelFromSnap(snap);
      var id = snap.exportedAt || new Date().toISOString();
      var list = readRecent().filter(function(item){ return item.id !== id; });
      list.unshift({ id: id, label: label, savedAt: snap.exportedAt || new Date().toISOString(), snap: snap });
      writeRecent(list);
      renderRecentPicker();
    }

    function pushArchive(snap){
      var st = snap && snap.state;
      if (!st || !st.econ) return 0;
      var list = readArchive();
      var ts = snap && snap.exportedAt ? snap.exportedAt : new Date().toISOString();
      var label = projectLabelFromSnap(snap);
      var id = ts + '-' + Math.random().toString(36).slice(2, 8);
      list.push({
        id: id,
        label: label,
        savedAt: ts,
        build: snap && snap.build ? snap.build : '',
        facility: st.facility === 'vertical' ? 'vertical' : 'greenhouse',
        projectClient: String(st.projectClient || '').trim(),
        projectCity: String(st.projectCity || '').trim(),
        projectTitle: String(st.projectTitle || '').trim(),
        econ: st.econ
      });
      return writeArchive(list);
    }

    function archiveEntryFromAny(item){
      if (!item) return null;
      if (item.econ){
        return {
          id: item.id || '',
          label: item.label || T('proj.recent.unnamed'),
          savedAt: item.savedAt || '',
          build: item.build || '',
          facility: item.facility === 'vertical' ? 'vertical' : 'greenhouse',
          projectClient: String(item.projectClient || '').trim(),
          projectCity: String(item.projectCity || '').trim(),
          projectTitle: String(item.projectTitle || '').trim(),
          econ: item.econ
        };
      }
      var snap = item.snap;
      var st = snap && snap.state;
      if (!st || !st.econ) return null;
      return {
        id: item.id || '',
        label: item.label || projectLabelFromSnap(snap),
        savedAt: item.savedAt || snap.exportedAt || '',
        build: item.build || snap.build || '',
        facility: st.facility === 'vertical' ? 'vertical' : 'greenhouse',
        projectClient: String(st.projectClient || '').trim(),
        projectCity: String(st.projectCity || '').trim(),
        projectTitle: String(st.projectTitle || '').trim(),
        econ: st.econ
      };
    }

    function renderRecentPicker(){
      var sel = document.getElementById('project-recent-picker');
      if (!sel) return;
      var list = readRecent();
      var html = '<option value="">' + T('proj.recent.placeholder') + '</option>';
      list.forEach(function(item, i){
        var when = '';
        try {
          when = new Date(item.savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        } catch (e2){ when = ''; }
        var lbl = String(item.label || T('proj.recent.unnamed')).slice(0, 48);
        html += '<option value="' + i + '">' + lbl + (when ? ' · ' + when : '') + '</option>';
      });
      sel.innerHTML = html;
      sel.value = '';
    }

    function esc(t){
      return String(t == null ? '' : t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function fmtNum(n, decimals){
      var v = Number(n);
      if (!isFinite(v)) return '—';
      if (deps.fmtNum) return deps.fmtNum(v);
      if (typeof decimals === 'number') return v.toFixed(decimals);
      return String(Math.round(v * 100) / 100);
    }

    function fmtMoney(n){
      var v = Number(n);
      if (!isFinite(v)) return '—';
      if (deps.fmtMoney) return deps.fmtMoney(v);
      var sym = deps.currencySym ? deps.currencySym() : '₽';
      return fmtNum(v, 0) + sym;
    }

    function facilityLabel(facility){
      return facility === 'vertical' ? T('facility.vertical') : T('facility.greenhouse');
    }

    function archiveMetricFromItem(item){
      var entry = archiveEntryFromAny(item);
      if (!entry || !deps.calcFarmEconomics) return null;
      var metric = {
        id: entry.id || '',
        savedAt: entry.savedAt || '',
        label: entry.label || T('proj.recent.unnamed'),
        facility: entry.facility === 'vertical' ? 'vertical' : 'greenhouse',
        client: String(entry.projectClient || '').trim(),
        plantingArea: 0,
        revenue: 0,
        margin: 0,
        marginPct: 0
      };
      try {
        var econ = JSON.parse(JSON.stringify(entry.econ));
        if (deps.migrateEconOtherElectricity) deps.migrateEconOtherElectricity(econ);
        var farm = deps.calcFarmEconomics(econ);
        metric.plantingArea = Number(farm.plantingArea) || 0;
        metric.revenue = Number(farm.revenue) || 0;
        metric.margin = Number(farm.margin) || 0;
        metric.marginPct = Number(farm.marginPct) || 0;
      } catch (e){ return null; }
      return metric;
    }

    function summarizeArchive(list){
      var items = Array.isArray(list) ? list : [];
      var metrics = items.map(archiveMetricFromItem).filter(function(x){ return !!x; });
      var byFacility = {
        greenhouse: { count: 0, revenue: 0, margin: 0, marginPct: 0, area: 0 },
        vertical: { count: 0, revenue: 0, margin: 0, marginPct: 0, area: 0 }
      };
      metrics.forEach(function(x){
        var g = byFacility[x.facility] || byFacility.greenhouse;
        g.count += 1;
        g.revenue += x.revenue;
        g.margin += x.margin;
        g.marginPct += x.marginPct;
        g.area += x.plantingArea;
      });
      function avg(group, key){
        if (!group.count) return 0;
        return group[key] / group.count;
      }
      var clients = {};
      metrics.forEach(function(x){
        if (x.client) clients[x.client.toLowerCase()] = 1;
      });
      var sortedByDate = metrics.slice().sort(function(a, b){
        return String(a.savedAt).localeCompare(String(b.savedAt));
      });
      var sortedByMargin = metrics.slice().sort(function(a, b){ return b.margin - a.margin; });
      var recent = sortedByDate.slice(Math.max(0, sortedByDate.length - 10)).reverse();
      return {
        total: metrics.length,
        uniqueClients: Object.keys(clients).length,
        firstSavedAt: sortedByDate.length ? sortedByDate[0].savedAt : '',
        lastSavedAt: sortedByDate.length ? sortedByDate[sortedByDate.length - 1].savedAt : '',
        avgRevenue: metrics.length ? (metrics.reduce(function(s, x){ return s + x.revenue; }, 0) / metrics.length) : 0,
        avgMargin: metrics.length ? (metrics.reduce(function(s, x){ return s + x.margin; }, 0) / metrics.length) : 0,
        avgMarginPct: metrics.length ? (metrics.reduce(function(s, x){ return s + x.marginPct; }, 0) / metrics.length) : 0,
        avgArea: metrics.length ? (metrics.reduce(function(s, x){ return s + x.plantingArea; }, 0) / metrics.length) : 0,
        best: sortedByMargin.length ? sortedByMargin[0] : null,
        worst: sortedByMargin.length ? sortedByMargin[sortedByMargin.length - 1] : null,
        recent: recent,
        byFacility: {
          greenhouse: {
            count: byFacility.greenhouse.count,
            avgRevenue: avg(byFacility.greenhouse, 'revenue'),
            avgMargin: avg(byFacility.greenhouse, 'margin'),
            avgMarginPct: avg(byFacility.greenhouse, 'marginPct'),
            avgArea: avg(byFacility.greenhouse, 'area')
          },
          vertical: {
            count: byFacility.vertical.count,
            avgRevenue: avg(byFacility.vertical, 'revenue'),
            avgMargin: avg(byFacility.vertical, 'margin'),
            avgMarginPct: avg(byFacility.vertical, 'marginPct'),
            avgArea: avg(byFacility.vertical, 'area')
          }
        }
      };
    }

    function renderProjectStatsInto(body){
      if (!body) return;
      var list = readArchive();
      var last = list.length ? list[list.length - 1] : null;
      var locale = typeof global.DG_getLocale === 'function' ? global.DG_getLocale() : '';
      var sym = deps.currencySym ? deps.currencySym() : '₽';
      var key = [list.length, last && last.id || '', last && last.savedAt || '', locale, sym].join('|');
      if (body.dataset.projectStatsKey === key) return;
      body.dataset.projectStatsKey = key;
      var stats = summarizeArchive(list);
      if (!stats.total){
        body.innerHTML = '<p class="compare-lead">' + T('proj.stats.empty') + '</p>';
        return;
      }
      function safeDate(iso){
        if (!iso) return '—';
        try {
          return new Date(iso).toLocaleString();
        } catch (e){ return iso; }
      }
      function metricRow(label, value){
        return '<tr><td>' + label + '</td><td><strong>' + value + '</strong></td></tr>';
      }
      var html = '';
      html += '<table class="econ-breakdown project-compare-table project-compare-table--summary"><tbody>';
      html += metricRow(T('proj.stats.count'), esc(stats.total));
      html += metricRow(T('proj.stats.uniqueClients'), esc(stats.uniqueClients));
      html += metricRow(T('proj.stats.period'), esc(safeDate(stats.firstSavedAt) + ' — ' + safeDate(stats.lastSavedAt)));
      html += metricRow(T('proj.stats.avgArea'), fmtNum(stats.avgArea) + ' ' + T('sum.unit.sqm'));
      html += metricRow(T('proj.stats.avgRevenue'), fmtMoney(stats.avgRevenue));
      html += metricRow(T('proj.stats.avgMargin'), fmtMoney(stats.avgMargin));
      html += metricRow(T('proj.stats.avgMarginPct'), fmtNum(stats.avgMarginPct) + '%');
      html += '</tbody></table>';

      html += '<p class="compare-lead" style="margin-top:10px">' + T('proj.stats.byFacility') + '</p>';
      html += '<div class="econ-table-scroll"><table class="econ-breakdown project-compare-table project-compare-table--facility"><thead><tr>' +
        '<th>' + T('proj.stats.facility') + '</th>' +
        '<th>' + T('proj.stats.countShort') + '</th>' +
        '<th>' + T('proj.stats.avgArea') + '</th>' +
        '<th>' + T('proj.stats.avgRevenue') + '</th>' +
        '<th>' + T('proj.stats.avgMargin') + '</th>' +
        '<th>' + T('proj.stats.avgMarginPct') + '</th>' +
        '</tr></thead><tbody>';
      ['greenhouse', 'vertical'].forEach(function(k){
        var g = stats.byFacility[k];
        html += '<tr>' +
          '<td>' + esc(facilityLabel(k)) + '</td>' +
          '<td>' + esc(g.count) + '</td>' +
          '<td>' + fmtNum(g.avgArea) + ' ' + T('sum.unit.sqm') + '</td>' +
          '<td>' + fmtMoney(g.avgRevenue) + '</td>' +
          '<td>' + fmtMoney(g.avgMargin) + '</td>' +
          '<td>' + fmtNum(g.avgMarginPct) + '%</td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';

      if (stats.best){
        html += '<p class="compare-meta"><strong>' + T('proj.stats.bestMargin') + ':</strong> ' +
          esc(stats.best.label) + ' · ' + fmtMoney(stats.best.margin) + '</p>';
      }
      if (stats.worst){
        html += '<p class="compare-meta"><strong>' + T('proj.stats.worstMargin') + ':</strong> ' +
          esc(stats.worst.label) + ' · ' + fmtMoney(stats.worst.margin) + '</p>';
      }
      if (stats.recent && stats.recent.length){
        html += '<p class="compare-lead" style="margin-top:10px">' + T('proj.stats.recent') + '</p>';
        html += '<div class="econ-table-scroll"><table class="econ-breakdown project-compare-table project-compare-table--recent"><thead><tr>' +
          '<th>' + T('proj.stats.period') + '</th>' +
          '<th>' + T('proj.title') + '</th>' +
          '<th>' + T('proj.stats.avgRevenue') + '</th>' +
          '<th>' + T('proj.stats.avgMargin') + '</th>' +
          '<th>' + T('proj.stats.avgMarginPct') + '</th>' +
          '</tr></thead><tbody>';
        stats.recent.forEach(function(r){
          html += '<tr><td>' + esc(safeDate(r.savedAt)) + '</td><td>' + esc(r.label || T('proj.recent.unnamed')) + '</td><td>' +
            fmtMoney(r.revenue) + '</td><td>' + fmtMoney(r.margin) + '</td><td>' + fmtNum(r.marginPct) + '%</td></tr>';
        });
        html += '</tbody></table></div>';
      }
      body.innerHTML = html;
    }

    function renderProjectStats(){
      renderProjectStatsInto(document.getElementById('project-stats-body'));
    }

    function renderProjectStatsPanel(){
      renderProjectStatsInto(document.getElementById('econ-project-stats-body'));
    }

    function applySnapshot(data){
      if (!data || data.v !== PROJECT_VERSION || !data.state){
        throw new Error(TF('proj.invalidVersion', { v: PROJECT_VERSION }));
      }
      if (deps.applyState) deps.applyState(data.state);
      else throw new Error(T('proj.applyStateMissing'));
      if (deps.onApplied) deps.onApplied(data);
    }

    function downloadJson(obj, filename){
      var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 500);
    }

    function exportProject(){
      var snap = snapshot();
      pushRecent(snap);
      var cv = deps.getCvName ? deps.getCvName() : 'calc';
      var slug = String(cv).replace(/[^a-zA-ZЀ-ӿ0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'calc';
      downloadJson(snap, 'daogreen-project-' + slug + '-' + new Date().toISOString().slice(0, 10) + '.json');
    }

    function saveToBrowser(){
      try {
        var snap = snapshot();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
        pushRecent(snap);
        pushArchive(snap);
        renderProjectStats();
        renderProjectStatsPanel();
        if (deps.toast) deps.toast(T('proj.savedBrowser'));
      } catch (e){
        alert(TF('proj.saveFailed', { msg: e.message || e }));
      }
    }

    function loadFromBrowser(){
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { alert(T('proj.noSaved')); return; }
        applySnapshot(JSON.parse(raw));
        if (deps.toast) deps.toast(T('proj.loadedBrowser'));
      } catch (e){
        alert(TF('proj.loadFailed', { msg: e.message || e }));
      }
    }

    function loadRecent(index){
      var list = readRecent();
      var item = list[parseInt(index, 10)];
      if (!item || !item.snap) return;
      try {
        applySnapshot(item.snap);
        if (deps.toast) deps.toast(T('proj.loadedRecent'));
      } catch (e){
        alert(TF('proj.loadFailed', { msg: e.message || e }));
      }
    }

    function pickFile(){
      if (!fileInput){
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,application/json';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', function(){
          var f = fileInput.files && fileInput.files[0];
          fileInput.value = '';
          if (!f) return;
          var reader = new FileReader();
          reader.onload = function(){
            try {
              var data = JSON.parse(reader.result);
              applySnapshot(data);
              pushRecent(data.v ? data : snapshot());
              if (deps.toast) deps.toast(T('proj.loadedFile'));
            } catch (e){
              alert(TF('proj.error', { msg: e.message || e }));
            }
          };
          reader.readAsText(f, 'utf-8');
        });
        document.body.appendChild(fileInput);
      }
      fileInput.click();
    }

    function exportArchiveJson(){
      var list = readArchive().map(archiveEntryFromAny).filter(function(x){ return !!x; });
      var payload = {
        v: PROJECT_VERSION,
        exportedAt: new Date().toISOString(),
        count: list.length,
        items: list
      };
      downloadJson(payload, 'daogreen-project-archive-' + new Date().toISOString().slice(0, 10) + '.json');
      if (deps.toast) deps.toast(T('proj.stats.exported'));
    }

    function clearArchive(){
      if (!confirm(T('proj.stats.confirmClear'))) return;
      try { localStorage.removeItem(ARCHIVE_KEY); } catch (e){ /* ignore */ }
      renderProjectStats();
      renderProjectStatsPanel();
      if (deps.toast) deps.toast(T('proj.stats.cleared'));
    }

    function openStatsDialog(){
      var dlg = document.getElementById('project-stats-dialog');
      if (!dlg) return;
      renderProjectStats();
      dlg.showModal();
    }

    var btnSave = document.getElementById('btn-project-save');
    var btnLoad = document.getElementById('btn-project-load');
    var btnExport = document.getElementById('btn-project-export');
    var btnImport = document.getElementById('btn-project-import');
    var btnStats = document.getElementById('btn-project-stats');
    var recentPicker = document.getElementById('project-recent-picker');
    var statsDialog = document.getElementById('project-stats-dialog');
    var statsExportBtn = document.getElementById('project-stats-export');
    var statsClearBtn = document.getElementById('project-stats-clear');
    if (btnSave && !btnSave.dataset.bound){
      btnSave.dataset.bound = '1';
      btnSave.addEventListener('click', saveToBrowser);
    }
    if (btnLoad && !btnLoad.dataset.bound){
      btnLoad.dataset.bound = '1';
      btnLoad.addEventListener('click', loadFromBrowser);
    }
    if (btnExport && !btnExport.dataset.bound){
      btnExport.dataset.bound = '1';
      btnExport.addEventListener('click', exportProject);
    }
    if (btnImport && !btnImport.dataset.bound){
      btnImport.dataset.bound = '1';
      btnImport.addEventListener('click', pickFile);
    }
    if (btnStats && !btnStats.dataset.bound){
      btnStats.dataset.bound = '1';
      btnStats.addEventListener('click', openStatsDialog);
    }
    if (statsExportBtn && !statsExportBtn.dataset.bound){
      statsExportBtn.dataset.bound = '1';
      statsExportBtn.addEventListener('click', exportArchiveJson);
    }
    if (statsClearBtn && !statsClearBtn.dataset.bound){
      statsClearBtn.dataset.bound = '1';
      statsClearBtn.addEventListener('click', clearArchive);
    }
    if (statsDialog && !statsDialog.dataset.bound){
      statsDialog.dataset.bound = '1';
      statsDialog.addEventListener('click', function(ev){
        if (ev.target.dataset.projectStatsClose != null) statsDialog.close();
      });
    }
    if (recentPicker && !recentPicker.dataset.bound){
      recentPicker.dataset.bound = '1';
      recentPicker.addEventListener('change', function(){
        if (!recentPicker.value) return;
        loadRecent(recentPicker.value);
      });
    }
    renderRecentPicker();
    renderProjectStatsPanel();
    global.DG_renderProjectStatsPanel = renderProjectStatsPanel;
  }

  global.DG_initProjectStore = initProjectStore;
  global.DG_PROJECT_VERSION = PROJECT_VERSION;
})(typeof window !== 'undefined' ? window : this);
