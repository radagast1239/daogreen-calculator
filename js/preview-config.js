/**
 * Шаблон предпросмотра (гости без входа).
 *
 * Собрано из: daogreen-project-Мангольд-2026-05-19 (2).json
 * — вкладка «Каналы», ВФ, мангольд baby (vf-chard-baby), 12 каналов.
 *
 * Ваши другие экспорты (чтобы сменить стартовый экран):
 *   npm run preview:from-project -- "…\daogreen-project-Базилик-2026-05-19.json"        → поддоны, базилик
 *   npm run preview:from-project -- "…\daogreen-project-Мангольд-2026-05-19 (1).json"   → экономика
 */
(function (g) {
  g.DG_PREVIEW_CONFIG = {
    georgyMode: false,
    appView: 'channels',
    facility: 'vertical',
    cv: 'aficion',
    temp: 22,
    month: 5,
    lighting: false,
    day: 14,
    germination: 8,
    nursery: 14,
    nch: 12,
    density: 220,
    offset: 50,
    pot: 50,
    multicut: true,
    ghUsefulArea: 100,
    palletCv: 'pl-basil-adult',
    vfCv: 'vf-chard-baby'
  };
})(typeof window !== 'undefined' ? window : global);
