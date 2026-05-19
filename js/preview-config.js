/**
 * Данные калькулятора в режиме предпросмотра (без входа).
 * Редактируйте этот файл и залейте на GitHub — гости увидят эти значения.
 *
 * appView: 'channels' | 'pallets' | 'economics'
 * facility: 'greenhouse' | 'vertical'
 * cv: id сорта (lollo, aficion, rucola, …) — только для каналов/теплицы
 * palletCv / vfCv: для вкладок поддоны / VF
 * georgyMode: всегда false в предпросмотре (кнопка Георгия скрыта)
 */
(function (g) {
  g.DG_PREVIEW_CONFIG = {
    appView: 'channels',
    facility: 'greenhouse',
    cv: 'lollo',
    temp: 26,
    month: null,
    lighting: false,
    day: 21,
    germination: 5,
    nursery: 14,
    nch: 13,
    density: 40,
    offset: 50,
    pot: 50,
    multicut: false,
    ghUsefulArea: 24,
    georgyMode: false
  };
})(typeof window !== 'undefined' ? window : global);
