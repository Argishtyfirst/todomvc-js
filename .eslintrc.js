module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-param-reassign': ['off'],
    'no-plusplus': ['off'],
    'no-console': ['off'],
  },
  overrides: [
    {
      files: [
        '*.test.js',
      ],
      env: {
        jest: true,
        jasmine: true,
      },
      rules: {
        'function-paren-newline': 'off',
        'global-require': 'off',
        'import/no-extraneous-dependencies': ['error', { 'devDependencies': true }],
        'no-underscore-dangle': 'off',
      },
    },
  ],
}
