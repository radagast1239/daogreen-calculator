/** Сохранение / загрузка проекта (JSON) — DG_initProjectStore */
(function(global){
  'use strict';

  var PROJECT_VERSION = 1;
  var STORAGE_KEY = 'daogreen-calc-project-v1';

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
      var cv = deps.getCvName ? deps.getCvName() : 'calc';
      var slug = String(cv).replace(/[^a-zA-ZЀ-ӿ0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'calc';
      downloadJson(snap, 'daogreen-project-' + slug + '-' + new Date().toISOString().slice(0, 10) + '.json');
    }

    function saveToBrowser(){
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
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
              applySnapshot(JSON.parse(reader.result));
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
  }

  global.DG_initProjectStore = initProjectStore;
  global.DG_PROJECT_VERSION = PROJECT_VERSION;
})(typeof window !== 'undefined' ? window : this);
