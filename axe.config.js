module.exports = {
  rules: [
    {
      id: 'color-contrast',
      enabled: true,
    },
    {
      id: 'label',
      enabled: true,
    },
    {
      id: 'button-name',
      enabled: true,
    },
    {
      id: 'link-name',
      enabled: true,
    },
  ],
  reporter: 'v2',
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
  },
  resultTypes: ['violations', 'incomplete'],
};
