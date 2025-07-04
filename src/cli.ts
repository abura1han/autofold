#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import type { FolderNode } from './types'
import {
	createDirectoryTree,
	createStructure,
	parsePathSegments,
	transformFlatObject,
	transformNestedTree,
	transformTreeString,
} from './utils'

const HELP = `
Usage:
  autofold [-f <format>] <tree-string-or-file>

Options:
  -f <format>  Specify input format: tree, nested, flat, segments, paths
               (default: tree)

Examples:
  autofold ./tree.txt
  autofold -f tree "/autofold\\n├── packages\\n│   ├── core"
  autofold -f nested '{"autofold": {".bunfig.toml": null, "packages": {}}}'
  autofold -f flat ./flat.json
`

const parseToJSON = (input: string) => {
	try {
		return JSON.parse(input)
	} catch (error) {
		console.error('❌ Input format malformed')
	}
}

async function main() {
	let format = 'tree' // Default format
	let inputArg: string | undefined
	const args = Bun.argv.slice(2) // Skip node and script path

	// Parse arguments
	if (args[0] === '--help') {
		console.log(HELP)
		process.exit(0)
	}

	if (args[0] === '-f' && args.length >= 2) {
		format = args[1]
		inputArg = args[2]
	} else if (args.length >= 1) {
		inputArg = args[0]
	} else {
		console.log(HELP)
		console.error('❌ Error: Missing input argument')
		process.exit(1)
	}

	// Validate format
	const validFormats = [
		'tree',
		'nested',
		'flat',
		'segments',
		'compact',
		'annotated',
	]
	if (!validFormats.includes(format)) {
		console.error(
			`❌ Error: Invalid format '${format}'. Supported formats: ${validFormats.join(', ')}`,
		)
		process.exit(1)
	}

	// Read input (file or direct content)
	let input: string
	if (inputArg && existsSync(inputArg)) {
		input = await Bun.file(inputArg).text()
	} else if (inputArg) {
		input = inputArg
	} else {
		console.error('❌ Error: No input provided')
		process.exit(1)
	}

	// Parse input based on format
	let nodes: FolderNode[]
	try {
		switch (format) {
			case 'tree':
				nodes = transformTreeString(input)
				break
			case 'nested':
				nodes = transformNestedTree(parseToJSON(input))
				break
			case 'flat':
				nodes = transformFlatObject(parseToJSON(input))
				break
			case 'segments':
				nodes = parsePathSegments(parseToJSON(input))
				break
			case 'paths':
				nodes = createDirectoryTree(parseToJSON(input))
				break
			default:
				throw new Error('Unexpected format')
		}
	} catch (err) {
		console.error(`❌ Error parsing input as ${format}:`)
		process.exit(1)
	}

	// Validate nodes
	if (!nodes || nodes.length === 0) {
		console.error('❌ Error: No valid nodes parsed from input')
		process.exit(1)
	}

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
