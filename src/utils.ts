import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Interface for the JSON structure
export interface FileNode {
	type: 'file' | 'folder'
	name: string
	children?: FileNode[]
}

// Common file extensions to identify files
const FILE_EXTENSIONS = [
	'.js',
	'.ts',
	'.json',
	'.toml',
	'.txt',
	'.md',
	'.yml',
	'.yaml',
	'.css',
	'.html',
	'.xml',
	'.csv',
	'.log',
	'.ini',
	'.conf',
	'.sh',
	'.py',
	'.java',
	'.c',
	'.cpp',
	'.h',
	'.hpp',
	'.sql',
	'.rb',
	'.go',
	'.php',
	'.swift',
	'.kt',
	'.rs',
	'.jsx',
	'.tsx',
	'.scss',
	'.sass',
]

// Parse tree string into an array of JSON structures
export function parseTree(input: string): FileNode[] {
	const lines = input.trim().split('\n')
	const nodes: FileNode[] = []
	const stack: FileNode[] = []
	let rootName = ''

	for (const rawLine of lines) {
		const cleanLine = rawLine.replace(/^[\s│├└─]+/, '').trim()
		if (!cleanLine) continue

		// Calculate indentation level (4 spaces per level in the input)
		const indentLevel = rawLine.match(/^[\s│├└─]+/)?.[0].length || 0
		const level = Math.floor(indentLevel / 4)

		// Handle root (first line like "/autofold")
		if (!rootName && cleanLine.startsWith('/')) {
			rootName = cleanLine.slice(1) // Remove the "/"
			const rootNode: FileNode = {
				type: 'folder',
				name: rootName,
				children: [],
			}
			nodes.push(rootNode)
			stack[0] = rootNode
			continue
		}

		// Determine if it's a file based on common file extensions
		const isFile = FILE_EXTENSIONS.some((ext) => cleanLine.endsWith(ext))
		const node: FileNode = {
			type: isFile ? 'file' : 'folder',
			name: cleanLine,
		}
		if (!isFile) {
			node.children = []
		}

		// Resize stack to current level and add node to parent's children
		stack.length = level
		stack[level - 1].children?.push(node)
		stack[level] = node
		nodes.push(node)
	}

	return nodes
}

// Convert array of paths to JSON structure
export function pathsToJson(paths: string[]): FileNode {
	const root: FileNode = { type: 'folder', name: '', children: [] }

	for (const p of paths) {
		const parts = p.split('/')
		let current = root

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i]
			const isFile =
				i === parts.length - 1 &&
				FILE_EXTENSIONS.some((ext) => part.endsWith(ext))

			if (!current.children) {
				current.children = []
			}

			let node = current.children.find(
				(child) =>
					child.name === part && child.type === (isFile ? 'file' : 'folder'),
			)

			if (!node) {
				node = {
					type: isFile ? 'file' : 'folder',
					name: part,
				}
				if (!isFile) {
					node.children = []
				}
				current.children.push(node)
			}

			current = node
		}
	}

	root.name = paths[0].split('/')[0]
	return root
}

// Create directory/file structure from JSON
export async function createStructure(
	structure: FileNode,
	base: string = '.',
	parentPath: string = '',
): Promise<void> {
	const fullPath = path.join(base, parentPath, structure.name)

	if (structure.type === 'file') {
		await writeFile(fullPath, '', 'utf8')
		console.log(`📝 Created file: ${fullPath}`)
	} else {
		if (!existsSync(fullPath)) {
			await mkdir(fullPath, { recursive: true })
			console.log(`📁 Created directory: ${fullPath}`)
		}

		if (structure.children) {
			for (const child of structure.children) {
				await createStructure(
					child,
					base,
					path.join(parentPath, structure.name),
				)
			}
		}
	}
}
