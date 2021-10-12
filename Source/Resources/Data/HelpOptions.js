export const getHelpOptions = (t) => {
  return [
    {
      label: t('app_doesnt_start'),
      value: 1,
    },
    {
      label: t('app_blocked'),
      value: 2,
    },
    {
      label: t('false_defects'),
      value: 3,
    },
    {
      label: t('continues_with_defect'),
      value: 4,
    },
    {
      label: t('camera_broken'),
      value: 5,
    },
    {
      label: t('new_defects'),
      value: 6,
    },
    {
      label: t('other'),
      value: 7,
    },
  ];
};

export const getLanguageOptions = (t) => {
  return [
    {
      label: t('english'),
      value: t('en'),
    },
    {
      label: t('portuguese'),
      value: t('pt'),
    },
    {
      label: t('italian'),
      value: t('it'),
    },
    {
      label: t('turkish'),
      value: t('tr'),
    },
    {
      label: t('german'),
      value: t('de'),
    },
  ];
};
