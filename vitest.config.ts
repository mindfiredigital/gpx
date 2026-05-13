import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
        exclude: [...configDefaults.exclude],
        environment: 'node',
        clearMocks: true,
        coverage: {
            provider: 'v8',
            reporter: ['lcov', 'html', 'text'],
            thresholds: {
                statements: 80,
                branches: 75,
                functions: 75,
                lines: 80
            }
        },
        globals: true
    },
});