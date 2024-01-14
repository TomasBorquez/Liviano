/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        include: ['**/tests/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text'],
        },
    },
})