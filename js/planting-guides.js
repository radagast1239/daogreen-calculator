/**
 * Collapsible-гайды: каналы (теплица) и поддоны (VF-условия).
 */
(function(global){
  'use strict';

  var CHANNEL_KEYS = [
    'guide.channel.scope',
    'guide.channel.env',
    'guide.channel.density',
    'guide.channel.multicut',
    'guide.channel.yield',
    'guide.channel.simple'
  ];

  var PALLET_KEYS = [
    'guide.pallet.scope',
    'guide.pallet.env',
    'guide.pallet.geom',
    'guide.pallet.multicut',
    'guide.pallet.yield',
    'guide.pallet.simple'
  ];

  function createPlantingGuides(deps){
    function t(k, vars, ru){
      if (deps.tFmt) return deps.tFmt(k, vars);
      var v = deps.t ? deps.t(k) : null;
      return (v && v !== k) ? v : (ru || '');
    }

    function renderBox(boxId, keys){
      var box = document.getElementById(boxId);
      if (!box) return;
      box.innerHTML = keys.map(function(k){
        var html = t(k, null, '');
        if (!html) return '';
        return '<section class="georgy-guide-sec">' + html + '</section>';
      }).join('');
    }

    function sync(){
      var chWrap = document.getElementById('panel-channel-guide');
      var plWrap = document.getElementById('panel-pallet-guide');
      var channels = deps.isChannelGreenhouse && deps.isChannelGreenhouse();
      var pallets = deps.isPalletView && deps.isPalletView();
      if (chWrap) chWrap.classList.toggle('env-block-hidden', !channels);
      if (plWrap) plWrap.classList.toggle('env-block-hidden', !pallets);
      if (channels) renderBox('panel-channel-guide-body', CHANNEL_KEYS);
      if (pallets) renderBox('panel-pallet-guide-body', PALLET_KEYS);
    }

    return { sync: sync };
  }

  global.DG_createPlantingGuides = createPlantingGuides;
})(typeof window !== 'undefined' ? window : this);
