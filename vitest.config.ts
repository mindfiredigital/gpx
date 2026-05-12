import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['__tests__/**/*.test.ts'],
        exclude: [...configDefaults.exclude],
        environment: 'node',
        clearMocks: true,
        coverage: {
            provider: 'v8',
            reporter: ['lcov', 'html', 'text']
        },
        globals: true
    },
});