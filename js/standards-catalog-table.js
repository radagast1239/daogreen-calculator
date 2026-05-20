/**
 * Вкладка «Справочник стандартов» — компактные таблицы по средам.
 * DG_createStandardsCatalogTable(deps)
 */
(function (global) {
  'use strict';

  function createStandardsCatalogTable(deps) {
    function pt(k) {
      return deps.pt ? deps.pt(k) : k;
    }
    function esc(s) {
      return deps.htmlEsc(String(s == null ? '' : s));
    }

    function sectionTitle(sections, id) {
      var sec = (sections || []).find(function (s) {
        return s.id === id;
      });
      return sec ? sec.title : id || '—';
    }

    function yesNo(v) {
      return v ? pt('stdcat.yes') : pt('stdcat.no');
    }

    /** Диапазон из аудита → значение в калькуляторе */
    function rangeCell(std, calc, suffix) {
      suffix = suffix || '';
      if (std == null || std === '') {
        return calc != null && calc !== '' ? '<strong>' + esc(calc) + suffix + '</strong>' : '—';
      }
      var s = String(std);
      var c = calc != null && calc !== '' ? String(calc) : '';
      if (!c || s === c) return esc(s) + suffix;
      return (
        '<span class="stdcat-range">' +
        esc(s) +
        '<span class="stdcat-arrow">\u2192</span><strong>' +
        esc(c) +
        suffix +
        '</strong></span>'
      );
    }

    function formatYield(cv) {
      var u = cv.countUnit === 'шт' ? pt('stdcat.unit.pcs') : pt('stdcat.unit.g');
      return rangeCell(cv.yieldPerCutStd, cv.yieldPerCutG, ' ' + u);
    }

    function sortSheetList(list, sections) {
      var order = {};
      (sections || []).forEach(function (s, i) {
        order[s.id] = i;
      });
      return list.slice().sort(function (a, b) {
        var sa = order[a.section] != null ? order[a.section] : 99;
        var sb = order[b.section] != null ? order[b.section] : 99;
        if (sa !== sb) return sa - sb;
        return (a.name || '').localeCompare(b.name || '', 'ru');
      });
    }

    function sheetColspan(withCells) {
      return withCells ? 8 : 7;
    }

    function buildSheetTableBody(list, sections, withCells) {
      var rows = sortSheetList(list, sections);
      var cols = sheetColspan(withCells);
      if (!rows.length) {
        return (
          '<tr><td colspan="' +
          cols +
          '" class="stdcat-empty">' +
          esc(pt('stdcat.empty')) +
          '</td></tr>'
        );
      }
      var out = [];
      var lastSec = null;
      rows.forEach(function (cv) {
        if (cv.section !== lastSec) {
          lastSec = cv.section;
          out.push(
            '<tr class="stdcat-grp"><td colspan="' +
              cols +
              '">' +
              esc(sectionTitle(sections, cv.section)) +
              '</td></tr>'
          );
        }
        var note = [cv.replaceNote, cv.cutNote].filter(Boolean).join(' · ');
        var tip = [cv.sub, note].filter(Boolean).join(' — ');
        out.push(
          '<tr>' +
            '<td class="stdcat-name">' +
            '<strong title="' +
            esc(tip) +
            '">' +
            esc(cv.name) +
            '</strong></td>' +
            '<td class="num">' +
            rangeCell(cv.germinationStd, cv.germination) +
            '</td>' +
            '<td class="num">' +
            rangeCell(cv.channelStd, cv.channelDays) +
            '</td>' +
            '<td class="num">' +
            rangeCell(cv.densityStd, cv.density) +
            '</td>' +
            (withCells
              ? '<td class="num">' +
                rangeCell(cv.palletCellsStd, cv.palletCells) +
                '</td>'
              : '') +
            '<td class="num">' +
            formatYield(cv) +
            '</td>' +
            '<td class="num">' +
            rangeCell(
              cv.cutIntervalStd,
              cv.cutInterval > 0 ? cv.cutInterval : ''
            ) +
            '</td>' +
            '<td class="num stdcat-yn">' +
            esc(yesNo(cv.multicut)) +
            '</td>' +
            (note
              ? '<td class="stdcat-note" title="' + esc(note) + '">' + esc(note) + '</td>'
              : '<td class="stdcat-note muted">—</td>') +
            '</tr>'
        );
      });
      return out.join('');
    }

    function sheetTableHead(withCells) {
      return (
        '<thead><tr>' +
        '<th scope="col">' +
        esc(pt('stdcat.col.name')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.germ')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.days')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.density')) +
        '</th>' +
        (withCells
          ? '<th scope="col" class="num">' + esc(pt('stdcat.col.cells')) + '</th>'
          : '') +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.yield')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.cut')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.multicut')) +
        '</th>' +
        '<th scope="col">' +
        esc(pt('stdcat.col.note')) +
        '</th>' +
        '</tr></thead>'
      );
    }

    function buildGhTableBody(list) {
      var rows = list.slice().sort(function (a, b) {
        return (a.name || '').localeCompare(b.name || '', 'ru');
      });
      if (!rows.length) {
        return (
          '<tr><td colspan="5" class="stdcat-empty">' +
          esc(pt('stdcat.empty')) +
          '</td></tr>'
        );
      }
      return rows
        .map(function (cv) {
          return (
            '<tr>' +
            '<td class="stdcat-name"><strong title="' +
            esc(cv.sub || '') +
            '">' +
            esc(cv.name) +
            '</strong></td>' +
            '<td class="num">' +
            esc(cv.M_max) +
            '</td>' +
            '<td class="num">' +
            esc(cv.t50) +
            '</td>' +
            '<td class="num stdcat-yn">' +
            esc(yesNo(cv.multicut)) +
            '</td>' +
            '<td class="num stdcat-yn">' +
            esc(yesNo(cv.babyGreen)) +
            '</td>' +
            '</tr>'
          );
        })
        .join('');
    }

    function sheetPanel(mode, hintKey, list, sections, withCells) {
      return (
        '<div class="stdcat-panel' +
        (mode === 'vf' ? ' on' : '') +
        '" data-stdcat-panel="' +
        mode +
        '" id="stdcat-panel-' +
        mode +
        '">' +
        '<details class="stdcat-details">' +
        '<summary>' +
        esc(pt('stdcat.about')) +
        '</summary>' +
        '<p class="stdcat-hint">' +
        esc(pt(hintKey)) +
        '</p></details>' +
        '<div class="stdcat-scroll"><table class="cal-table stdcat-table">' +
        sheetTableHead(withCells) +
        '<tbody>' +
        buildSheetTableBody(list, sections, withCells) +
        '</tbody></table></div></div>'
      );
    }

    function bindStdcatMode(host) {
      if (host.dataset.stdcatBound) return;
      host.dataset.stdcatBound = '1';
      host.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-stdcat-mode]');
        if (!btn || !host.contains(btn)) return;
        var mode = btn.getAttribute('data-stdcat-mode');
        host.querySelectorAll('.stdcat-mode-btn').forEach(function (b) {
          b.classList.toggle('on', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        host.querySelectorAll('.stdcat-panel').forEach(function (p) {
          p.classList.toggle('on', p.getAttribute('data-stdcat-panel') === mode);
        });
      });
    }

    function renderStandardsCatalog() {
      var root = deps.$('view-standards');
      var host = deps.$('standards-catalog-host');
      if (!root || !host) return;

      var vf = deps.allVfCultivars ? deps.allVfCultivars() : [];
      var pal = deps.allPalletCultivars ? deps.allPalletCultivars() : [];
      var gh = deps.allGhCultivars ? deps.allGhCultivars() : [];
      var vfSec = deps.VF_SECTIONS || [];
      var palSec = deps.PALLET_SECTIONS || [];

      host.innerHTML =
        '<div class="stdcat-toolbar" role="tablist" aria-label="' +
        esc(pt('stdcat.modeAria')) +
        '">' +
        '<button type="button" class="stdcat-mode-btn on" data-stdcat-mode="vf" role="tab" aria-selected="true">' +
        esc(pt('stdcat.mode.vf')) +
        ' <span class="stdcat-count">' +
        vf.length +
        '</span></button>' +
        '<button type="button" class="stdcat-mode-btn" data-stdcat-mode="pal" role="tab" aria-selected="false">' +
        esc(pt('stdcat.mode.pal')) +
        ' <span class="stdcat-count">' +
        pal.length +
        '</span></button>' +
        '<button type="button" class="stdcat-mode-btn" data-stdcat-mode="gh" role="tab" aria-selected="false">' +
        esc(pt('stdcat.mode.gh')) +
        ' <span class="stdcat-count">' +
        gh.length +
        '</span></button>' +
        '</div>' +
        '<p class="stdcat-legend">' +
        esc(pt('stdcat.legend')) +
        '</p>' +
        sheetPanel('vf', 'stdcat.hint.vf', vf, vfSec, false) +
        sheetPanel('pal', 'stdcat.hint.pal', pal, palSec, true) +
        '<div class="stdcat-panel" data-stdcat-panel="gh" id="stdcat-panel-gh">' +
        '<details class="stdcat-details"><summary>' +
        esc(pt('stdcat.about')) +
        '</summary><p class="stdcat-hint">' +
        esc(pt('stdcat.hint.gh')) +
        '</p></details>' +
        '<div class="stdcat-scroll"><table class="cal-table stdcat-table">' +
        '<thead><tr>' +
        '<th scope="col">' +
        esc(pt('stdcat.col.name')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.mmax')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.t50')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.multicut')) +
        '</th>' +
        '<th scope="col" class="num">' +
        esc(pt('stdcat.col.baby')) +
        '</th>' +
        '</tr></thead><tbody>' +
        buildGhTableBody(gh) +
        '</tbody></table></div></div>';

      bindStdcatMode(host);
      if (global.DG_applyDomI18n) global.DG_applyDomI18n(root);
    }

    return { renderStandardsCatalog: renderStandardsCatalog };
  }

  global.DG_createStandardsCatalogTable = createStandardsCatalogTable;
})(typeof window !== 'undefined' ? window : this);
