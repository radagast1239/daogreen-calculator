/**
 * Пользовательские сорта (localStorage).
 * DG_createPlantingCustomCv(deps) — после buildDefaultGh/VfStandards в калькуляторе.
 */
(function (global) {
  'use strict';

  global.DG_CUSTOM_CULTIVARS_STORAGE = 'calc-custom-cultivars';

  function createPlantingCustomCv(deps) {
    function st() {
      return deps.getState();
    }

    function storageKey() {
      return deps.storageKey || global.DG_CUSTOM_CULTIVARS_STORAGE;
    }

    function newCustomCvId(prefix) {
      return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    }

    function loadCustomCultivarsStore() {
      var state = st();
      try {
        var raw = localStorage.getItem(storageKey());
        if (!raw) return;
        var data = JSON.parse(raw);
        if (data && Array.isArray(data.gh)) state.customGhCultivars = data.gh;
        if (data && Array.isArray(data.vf)) state.customVfCultivars = data.vf;
      } catch (_) {
        state.customGhCultivars = [];
        state.customVfCultivars = [];
      }
    }

    function saveCustomCultivarsStore() {
      var state = st();
      try {
        localStorage.setItem(
          storageKey(),
          JSON.stringify({
            gh: state.customGhCultivars || [],
            vf: state.customVfCultivars || []
          })
        );
      } catch (_) {}
    }

    function blankGhCultivarTemplate() {
      return {
        id: '',
        name: '',
        sub: deps.pt('cv.customSub'),
        M_max: 120,
        k: 0.4,
        t50: 22,
        ca: 13.0,
        bolt: 35,
        multicut: true,
        heatSigma: 90,
        heatBolt: 1.3,
        t_opt: 22,
        babyGreen: false
      };
    }

    function blankVfCultivarTemplate(section) {
      return {
        id: '',
        name: '',
        sub: deps.pt('cv.customSub'),
        section: section || 'baby',
        vfSheet: true,
        germination: 5,
        channelDays: 25,
        density: 80,
        cutInterval: 15,
        yieldPerCutG: 15,
        countUnit: 'g',
        multicut: true,
        M_max: 40,
        k: 0.38,
        t50: 30,
        ca: 10,
        bolt: 90,
        t_opt: 22,
        babyGreen: true,
        heatSigma: 70,
        heatBolt: 1.1
      };
    }

    function addCustomGhCultivar(name, templateCv) {
      var state = st();
      var tpl = templateCv != null ? templateCv : deps.getCv();
      var id = newCustomCvId('custom-gh-');
      var cv = Object.assign({}, tpl, {
        id: id,
        name: String(name).trim(),
        sub: deps.pt('cv.customSub'),
        custom: true
      });
      state.customGhCultivars.push(cv);
      state.cv = id;
      state.ghStandards[id] = deps.buildDefaultGhStandards(cv);
      saveCustomCultivarsStore();
      return cv;
    }

    function addCustomVfCultivar(name, section, templateCv) {
      var state = st();
      var tpl = templateCv != null ? templateCv : deps.getVfCv();
      var id = newCustomCvId('custom-vf-');
      var cv = Object.assign({}, tpl, {
        id: id,
        name: String(name).trim(),
        sub: deps.pt('cv.customSub'),
        custom: true,
        vfSheet: true,
        section: section || tpl.section || 'baby'
      });
      state.customVfCultivars.push(cv);
      state.vfCv = id;
      state.vfUserStandards[id] = deps.buildDefaultVfStandards(cv);
      saveCustomCultivarsStore();
      return cv;
    }

    function removeCustomCultivar(id) {
      if (!id) return false;
      var state = st();
      var removed = false;
      if (id.indexOf('custom-gh-') === 0) {
        var i = (state.customGhCultivars || []).findIndex(function (c) {
          return c.id === id;
        });
        if (i >= 0) {
          state.customGhCultivars.splice(i, 1);
          removed = true;
        }
        delete state.ghStandards[id];
        if (state.cv === id) state.cv = deps.CULTIVARS[0] ? deps.CULTIVARS[0].id : '';
      } else if (id.indexOf('custom-vf-') === 0) {
        var j = (state.customVfCultivars || []).findIndex(function (c) {
          return c.id === id;
        });
        if (j >= 0) {
          state.customVfCultivars.splice(j, 1);
          removed = true;
        }
        delete state.vfUserStandards[id];
        if (state.vfCv === id) state.vfCv = deps.VF_CULTIVARS[0] ? deps.VF_CULTIVARS[0].id : '';
      }
      if (removed) saveCustomCultivarsStore();
      return removed;
    }

    return {
      newCustomCvId: newCustomCvId,
      loadCustomCultivarsStore: loadCustomCultivarsStore,
      saveCustomCultivarsStore: saveCustomCultivarsStore,
      blankGhCultivarTemplate: blankGhCultivarTemplate,
      blankVfCultivarTemplate: blankVfCultivarTemplate,
      addCustomGhCultivar: addCustomGhCultivar,
      addCustomVfCultivar: addCustomVfCultivar,
      removeCustomCultivar: removeCustomCultivar
    };
  }

  global.DG_createPlantingCustomCv = createPlantingCustomCv;
})(typeof window !== 'undefined' ? window : globalThis);
