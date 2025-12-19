import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['node', 'vitest'],
    ignores: [...neostandard.resolveIgnoresFromGitignore()],
    noJsx: true,
    noStyle: true
  }),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  {
    files: [
      '**/*.test.js',
      '**/test/**/*.js',
      '**/test-data-and-results/**/*.js'
    ],
    rules: {
      camelcase: 'off'
    }
  }
]
