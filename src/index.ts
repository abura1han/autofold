#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const HELP = `
Usage:
  autofold <tree-string-or-file>

Example:
  autofold ./tree.txt
`

export function parseTree(tree: string): string[] {
	const lines = tree
		.split('\n')
		.map((line) => line.trimEnd()) // remove only end
		.filter((line) => line && !line.includes('...'))

	const stack: string[] = []
	const paths: string[] = []

	for (const line of lines) {
		const indentPart = (line.match(/^[├│└─ ]+/) || [''])[0]
		const level = Math.floor(indentPart.replace(/[^ ]/g, '').length / 2)

		const cleanLine = line
			.replace(/^[├│└─ ]+/, '')
			.split('#')[0]
			.trim()
		if (!cleanLine) continue

		stack.splice(level) // safely truncate to the correct level
		stack.push(cleanLine)

		const fullPath = path.join(...stack)
		paths.push(fullPath)
	}

	return paths
}

export async function createStructure(
	paths: string[],
	base: string = String('.'),
): Promise<void> {
	for (const p of paths) {
		const fullPath = path.join(base, p)
		if (p.endsWith('.json') || p.endsWith('.toml')) {
			await writeFile(fullPath, '', 'utf8')
			console.log(`📝 Created file: ${fullPath}`)
		} else {
			if (!existsSync(fullPath)) {
				await mkdir(fullPath, { recursive: true })
				console.log(`📁 Created directory: ${fullPath}`)
			}
		}
	}
}

async function main() {
	const arg = Bun.argv[2]
	if (!arg || arg === '--help') {
		console.log(HELP)
		process.exit(0)
	}

	let input = ''
	if (existsSync(arg)) {
		input = await Bun.file(arg).text()
	} else {
		input = arg
	}

	const paths = parseTree(input)
	const root = paths[0].startsWith('/') ? paths[0].slice(1) : 'output'

	await createStructure(paths, '.')
}

main().catch((err) => {
	console.error('❌ Error:', err)
	process.exit(1)
})
