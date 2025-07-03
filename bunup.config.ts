import { defineConfig } from 'bunup'

export default defineConfig({
	entry: ['src/index.ts', 'src/cli.ts'],
	format: ['esm', 'cjs'],
	target: 'bun',
	minify: true,
	dts: true,
	splitting: true,
})
