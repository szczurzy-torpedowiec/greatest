import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';
import { useStorage } from 'src/utils';

import messages from 'src/i18n';

const i18n = createI18n({
  locale: useStorage('language', () => 'en-US').value,
  messages,
});

export default boot(({ app }) => {
  app.use(i18n);
});

export { i18n };
