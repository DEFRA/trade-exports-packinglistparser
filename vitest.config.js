import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: [
        ...configDefaults.exclude,
        'coverage',
        // Vitest 4 V8 AST coverage cannot parse binary or non-JS file types
        'src/packing-lists/**',
        '**/*.xlsx',
        '**/*.xls',
        '**/*.csv',
        '**/*.pdf',
        '**/*.md'
      ]
    },
    setupFiles: ['.vite/setup-files.js']
  }
})
