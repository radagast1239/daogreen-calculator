/** Сохранение / загрузка проекта (JSON) — DG_initProjectStore */
(function(global){
  'use strict';

  var PROJECT_VERSION = 1;
  var STORAGE_KEY = 'daogreen-calc-project-v1';
  var RECENT_KEY = 'daogreen-calc-recent-v1';
  var RECENT_MAX = 5;

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

    function pushRecent(snap){
      var label = projectLabelFromSnap(snap);
      var id = snap.exportedAt || new Date().toISOString();
      var list = readRecent().filter(function(item){ return item.id !== id; });
      list.unshift({ id: id, label: label, savedAt: snap.exportedAt || new Date().toISOString(), snap: snap });
      writeRecent(list);
      renderRecentPicker();
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

    var btnSave = document.getElementById('btn-project-save');
    var btnLoad = document.getElementById('btn-project-load');
    var btnExport = document.getElementById('btn-project-export');
    var btnImport = document.getElementById('btn-project-import');
    var recentPicker = document.getElementById('project-recent-picker');
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
    if (recentPicker && !recentPicker.dataset.bound){
      recentPicker.dataset.bound = '1';
      recentPicker.addEventListener('change', function(){
        if (!recentPicker.value) return;
        loadRecent(recentPicker.value);
      });
    }
    renderRecentPicker();
  }

  global.DG_initProjectStore = initProjectStore;
  global.DG_PROJECT_VERSION = PROJECT_VERSION;
})(typeof window !== 'undefined' ? window : this);
