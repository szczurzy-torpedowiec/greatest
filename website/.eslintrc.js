const { resolve } = require('path');
module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  // https://eslint.vuejs.org/user-guide/#how-to-use-custom-parser
  // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
  // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
  parserOptions: {
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
    // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
    // Needed to make the parser take into account 'vue' files
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
    project: resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },

  env: {
    browser: true
  },

  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:vue/vue3-recommended',
    'airbnb-base',
    'plugin:@intlify/vue-i18n/recommended',
  ],

  plugins: [
    '@typescript-eslint',
    'vue',
  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly',
    defineProps: 'readonly'
  },

  rules: {
    'no-param-reassign': 'off',
    'no-void': 'off',
    'no-nested-ternary': 'off',
    'max-classes-per-file': 'off',

    'import/first': 'off',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'prefer-promise-reject-errors': 'off',

    // TypeScript
    quotes: ['warn', 'single', { avoidEscape: true }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': 'off',
    'no-console': ['warn', { allow: ["warn", "error"] }],
    'no-spaced-func': 'off',
    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': 'error',
    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }],
    "no-redeclare": 'off',
    '@typescript-eslint/no-redeclare': ['error'],
    'default-case': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    'consistent-return': 'off',
    'vue/return-in-computed-property': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'array-callback-return': 'off'
  },
  overrides: [
    {
      files: "src/components/render/**.vue",
      rules: {
        '@intlify/vue-i18n/no-raw-text': 'off'
      }
    }
  ],
  settings: {
    'vue-i18n': {
      localeDir: './src/i18n/**/*.{json,json5,yaml,yml}',
    }
  }
}
