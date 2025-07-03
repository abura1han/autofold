#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { createStructure, parseTree } from './utils'

const HELP = `
Usage:
  autofold <tree-string-or-file>

Example:
  autofold ./tree.txt
`

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

	const nodes = parseTree(input)
	const rootNode = nodes[0] // Use the first node (root) for creating the structure
	const rootName = rootNode.name.startsWith('/')
		? rootNode.name.slice(1)
		: 'output'

	await createStructure(rootNode, '.')
}

main().catch((err) => {
	console.error('❌ Error:', err)
	process.exit(1)
})
