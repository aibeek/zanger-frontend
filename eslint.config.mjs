import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
})

const eslintConfig = [
    {
        ignores: [
            '.next/**',
            'node_modules/**',
            'dist/**',
            'out/**',
            'coverage/**',
            '.next/types/**',
            'next-env.d.ts',
        ],
    },
    ...compat.config({
        extends: ['next', 'next/core-web-vitals', 'next/typescript'],
        rules: {
            'react-hooks/exhaustive-deps': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
        },
    }),
]

export default eslintConfig
