import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export function parseTree(input: string): string[] {
	const lines = input.trim().split('\n')
	const paths: string[] = []
	const stack: string[] = []

	let root = ''

	for (const rawLine of lines) {
		const cleanLine = rawLine.replace(/^[\s│├└─]+/, '').trim()
		if (!cleanLine) continue

		// Calculate indentation level (each level is typically 2 or 4 spaces, adjust as needed)
		const indentLevel = rawLine.match(/^[\s│├└─]+/)?.[0].length || 0
		const level = Math.floor(indentLevel / 4) // Adjust based on tree input (4 spaces per level in your input)

		// Handle root (first line like "/autofold")
		if (!root && cleanLine.startsWith('/')) {
			root = cleanLine.slice(1) // Remove the "/"
			paths.push(root)
			stack[0] = root
			continue
		}

		// Resize stack to current level
		stack.length = level

		// Add current node to stack
		stack[level] = cleanLine

		// Construct full path by joining stack elements up to current level
		const fullPath = stack.slice(0, level + 1).join('/')
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
