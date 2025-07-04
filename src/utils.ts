import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { FILE_EXTENSIONS } from './constants'
import type { FolderNode, NestedTree } from './types'

/**
 * Transforms a tree string representation into an array of FolderNode objects.
 * The input string represents a directory structure using ASCII characters (e.g., ├, └, │, ─).
 * @param input - The string representation of the directory tree.
 * @returns An array of FolderNode objects representing the parsed directory structure.
 * @example
 * ```typescript
 * const treeString = `
 * project
 * ├── src
 * │   ├── index.ts
 * │   └── utils
 * │       └── helper.ts
 * └── package.json
 * `;
 * const result = transformTreeString(treeString);
 * // Returns:
 * // [
 * //   {
 * //     type: 'folder',
 * //     name: 'project',
 * //     children: [
 * //       {
 * //         type: 'folder',
 * //         name: 'src',
 * //         children: [
 * //           { type: 'file', name: 'index.ts' },
 * //           {
 * //             type: 'folder',
 * //             name: 'utils',
 * //             children: [{ type: 'file', name: 'helper.ts' }]
 * //           }
 * //         ]
 * //       },
 * //       { type: 'file', name: 'package.json' }
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function transformTreeString(input: string): FolderNode[] {
	if (!input || typeof input !== 'string' || input.trim() === '') {
		return []
	}

	const lines = input
		.split('\n')
		.map((line) => line.replace(/\r$/, '')) // remove carriage return
		.map((line) => {
			// Remove inline comments (// or #) but only outside of paths
			const commentIndex = line.search(/(?<!\/)\/\/|(?<!\w)#/)
			if (commentIndex !== -1) {
				return line.slice(0, commentIndex).trimEnd()
			}
			return line
		})
		.filter((line) => line.trim() !== '')

	const rootNodes: FolderNode[] = []
	const parentStack: { depth: number; node: FolderNode }[] = []

	for (const rawLine of lines) {
		const line = rawLine.replace(/^([├└│─\s]*)/, (match) =>
			match.replace(/[├└│─]/g, ' '),
		)

		const trimmed = line.trim()
		if (!trimmed) continue

		const depth = Math.floor(rawLine.search(/[^\s│├└─]/) / 4)
		const isFile = trimmed.includes('.')

		const node: FolderNode = {
			type: isFile ? 'file' : 'folder',
			name: trimmed.replace(/^\//, ''),
			...(isFile ? {} : { children: [] }),
		}

		while (
			parentStack.length > 0 &&
			parentStack[parentStack.length - 1].depth >= depth
		) {
			parentStack.pop()
		}

		if (parentStack.length === 0) {
			rootNodes.push(node)
		} else {
			const parent = parentStack[parentStack.length - 1].node
			if (parent.children) {
				parent.children.push(node)
			}
		}

		if (!isFile) {
			parentStack.push({ depth, node })
		}
	}

	sortChildren(rootNodes)
	return rootNodes
}

/**
 * Transforms a nested object (NestedTree) into an array of FolderNode objects.
 * The input object represents a directory structure where folders are objects and files are null or empty objects with a file extension.
 * @param input - The nested object representing the directory structure.
 * @returns An array of FolderNode objects representing the parsed directory structure.
 * @example
 * ```typescript
 * const nestedTree = {
 *   autofold: {
 *     '.bunfig.toml': null,
 *     src: {
 *       'index.ts': null,
 *       utils: {
 *         'helper.ts': null
 *       }
 *     }
 *   }
 * };
 * const result = transformNestedTree(nestedTree);
 * // Returns:
 * // [
 * //   {
 * //     type: 'folder',
 * //     name: 'autofold',
 * //     children: [
 * //       { type: 'file', name: '.bunfig.toml' },
 * //       {
 * //         type: 'folder',
 * //         name: 'src',
 * //         children: [
 * //           { type: 'file', name: 'index.ts' },
 * //           {
 * //             type: 'folder',
 * //             name: 'utils',
 * //             children: [{ type: 'file', name: 'helper.ts' }]
 * //           }
 * //         ]
 * //       }
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function transformNestedTree(input: NestedTree): FolderNode[] {
	// Early return for empty or invalid input
	if (!input || typeof input !== 'object') {
		return []
	}

	function traverse(obj: NestedTree, parentName: string = ''): FolderNode[] {
		const nodes: FolderNode[] = []

		for (const [name, value] of Object.entries(obj)) {
			// Skip invalid entries
			if (!name) {
				continue
			}

			const isFile =
				value === null ||
				(Object.keys(value).length === 0 && name.includes('.'))
			const node: FolderNode = {
				type: isFile ? 'file' : 'folder',
				name,
				...(isFile ? {} : { children: [] }),
			}

			// Recursively process children if it's a folder
			if (!isFile && value && typeof value === 'object') {
				node.children = traverse(value, name)
			}

			nodes.push(node)
		}

		// Sort nodes: folders first, then files, alphabetically by name
		nodes.sort((a, b) => {
			if (a.type !== b.type) {
				return a.type === 'folder' ? -1 : 1
			}
			return a.name.localeCompare(b.name)
		})

		return nodes
	}

	const result = traverse(input)

	return result
}

/**
 * Transforms a flat object with boolean values into an array of FolderNode objects.
 * The keys represent file or folder paths, and the values indicate their presence.
 * @param input - A flat object where keys are file/folder paths and values are booleans.
 * @returns An array of FolderNode objects representing the parsed directory structure.
 * @example
 * ```typescript
 * const flatObject = {
 *   'autofold': true,
 *   'autofold/.bunfig.toml': true,
 *   'autofold/src': true,
 *   'autofold/src/index.ts': true,
 *   'autofold/src/utils': true,
 *   'autofold/src/utils/helper.ts': true
 * };
 * const result = transformFlatObject(flatObject);
 * // Returns:
 * // [
 * //   {
 * //     type: 'folder',
 * //     name: 'autofold',
 * //     children: [
 * //       { type: 'file', name: '.bunfig.toml' },
 * //       {
 * //         type: 'folder',
 * //         name: 'src',
 * //         children: [
 * //           { type: 'file', name: 'index.ts' },
 * //           {
 * //             type: 'folder',
 * //             name: 'utils',
 * //             children: [{ type: 'file', name: 'helper.ts' }]
 * //           }
 * //         ]
 * //       }
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function transformFlatObject(
	input: Record<string, boolean>,
): FolderNode[] {
	// Early return for empty or invalid input
	if (!input || typeof input !== 'object' || Object.keys(input).length === 0) {
		return []
	}

	// Map to store nodes by their full path for quick lookup
	const nodeMap = new Map<string, FolderNode>()
	const rootNodes: FolderNode[] = []

	// Process each key in the input
	for (const path of Object.keys(input)) {
		if (!path || typeof path !== 'string') {
			continue // Skip invalid keys
		}

		const segments = path.split('/')
		if (segments.length === 0) {
			continue // Skip empty paths
		}

		let currentPath = ''
		let parentNode: FolderNode | null = null

		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i]
			if (!segment) {
				continue // Skip empty segments
			}

			// Construct the full path for this segment
			currentPath = currentPath ? `${currentPath}/${segment}` : segment

			// Check if node already exists
			let node = nodeMap.get(currentPath)
			if (!node) {
				// Determine if this is a file (last segment and contains a dot) or folder
				const isFile = i === segments.length - 1 && segment.includes('.')
				node = {
					type: isFile ? 'file' : 'folder',
					name: segment,
					...(isFile ? {} : { children: [] }),
				}

				// Store node in map
				nodeMap.set(currentPath, node)

				// If this is a root node (first segment), add to rootNodes
				if (i === 0) {
					rootNodes.push(node)
				}
				// Otherwise, add to parent's children
				else if (parentNode && !!parentNode.children) {
					parentNode.children.push(node)
				}
			}

			parentNode = node.type === 'folder' ? node : null
		}
	}

	sortChildren(rootNodes)

	return rootNodes
}

/**
 * Transforms an array of path segments into an array of FolderNode objects.
 * Each path segment array represents a file or folder path.
 * @param paths - An array of string arrays, where each inner array represents a path.
 * @returns An array of FolderNode objects representing the parsed directory structure.
 * @example
 * ```typescript
 * const pathSegments = [
 *   ['autofold'],
 *   ['autofold', '.bunfig.toml'],
 *   ['autofold', 'src'],
 *   ['autofold', 'src', 'index.ts'],
 *   ['autofold', 'src', 'utils'],
 *   ['autofold', 'src', 'utils', 'helper.ts']
 * ];
 * const result = parsePathSegments(pathSegments);
 * // Returns:
 * // [
 * //   {
 * //     type: 'folder',
 * //     name: 'autofold',
 * //     children: [
 * //       { type: 'file', name: '.bunfig.toml' },
 * //       {
 * //         type: 'folder',
 * //         name: 'src',
 * //         children: [
 * //           { type: 'file', name: 'index.ts' },
 * //           {
 * //             type: 'folder',
 * //             name: 'utils',
 * //             children: [{ type: 'file', name: 'helper.ts' }]
 * //           }
 * //         ]
 * //       }
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function parsePathSegments(paths: string[][]): FolderNode[] {
	// Early return for empty input
	if (!paths || paths.length === 0) {
		return []
	}

	// Map to store nodes by their full path for quick lookup
	const nodeMap = new Map<string, FolderNode>()
	const rootNodes: FolderNode[] = []

	for (const segments of paths) {
		if (!segments || segments.length === 0) {
			continue // Skip empty or invalid segment arrays
		}

		let currentPath = ''
		let parentNode: FolderNode | null = null

		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i]
			if (!segment) {
				continue // Skip empty segments
			}

			// Construct the full path for this segment
			currentPath = currentPath ? `${currentPath}/${segment}` : segment

			// Check if node already exists
			let node = nodeMap.get(currentPath)
			if (!node) {
				// Determine if this is a file (last segment and contains a dot) or folder
				const isFile = i === segments.length - 1 && segment.includes('.')
				node = {
					type: isFile ? 'file' : 'folder',
					name: segment,
					...(isFile ? {} : { children: [] }),
				}

				// Store node in map
				nodeMap.set(currentPath, node)

				// If this is a root node (first segment), add to rootNodes
				if (i === 0) {
					rootNodes.push(node)
				}
				// Otherwise, add to parent's children
				else if (parentNode && !!parentNode.children) {
					parentNode.children?.push(node)
				}
			}

			parentNode = node.type === 'folder' ? node : null
		}
	}

	sortChildren(rootNodes)

	return rootNodes
}

/**
 * Creates a directory tree from an array of path strings.
 * Each path represents a file or folder in the directory structure.
 * @param paths - An array of strings representing file or folder paths.
 * @returns An array of FolderNode objects representing the parsed directory structure.
 * @example
 * ```typescript
 * const paths = [
 *   'autofold/.bunfig.toml',
 *   'autofold/src/index.ts',
 *   'autofold/src/utils/helper.ts'
 * ];
 * const result = createDirectoryTree(paths);
 * // Returns:
 * // [
 * //   {
 * //     type: 'folder',
 * //     name: 'autofold',
 * //     children: [
 * //       { type: 'file', name: '.bunfig.toml' },
 * //       {
 * //         type: 'folder',
 * //         name: 'src',
 * //         children: [
 * //           { type: 'file', name: 'index.ts' },
 * //           {
 * //             type: 'folder',
 * //             name: 'utils',
 * //             children: [{ type: 'file', name: 'helper.ts' }]
 * //           }
 * //         ]
 * //       }
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function createDirectoryTree(paths: string[]): FolderNode[] {
	// Handle empty input
	if (!paths || paths.length === 0) {
		return []
	}

	const root: FolderNode = {
		type: 'folder',
		name: '',
		children: [],
	}

	// Sort paths to ensure consistent processing
	const sortedPaths = [...paths].sort()

	for (const path of sortedPaths) {
		// Skip empty or invalid paths
		if (!path || typeof path !== 'string' || path.trim() === '') {
			continue
		}

		// Split path into parts and clean them
		const parts = path.split('/').filter((part) => part && part.trim() !== '')
		if (parts.length === 0) {
			continue
		}

		let currentNode = root

		// Process each part of the path
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i]
			const isLastPart = i === parts.length - 1
			const isFile = hasFileExtension(part)
			const nodeType = isLastPart && isFile ? 'file' : 'folder'

			// Find existing node or create new one
			let nextNode = currentNode.children?.find(
				(node) => node.name === part && node.type === nodeType,
			)

			if (!nextNode) {
				nextNode = {
					type: nodeType,
					name: part,
				}

				// Initialize children array for folders
				if (nodeType === 'folder') {
					nextNode.children = []
				}

				// Initialize children array if it doesn't exist
				if (!currentNode.children) {
					currentNode.children = []
				}

				// Add new node to children
				currentNode.children.push(nextNode)

				// Sort children to maintain consistent order
				currentNode.children.sort((a, b) => {
					if (a.type === b.type) {
						return a.name.localeCompare(b.name)
					}
					return a.type === 'folder' ? -1 : 1
				})
			}

			currentNode = nextNode
		}
	}

	// If root has only one child, return that child if it's a folder
	if (root.children?.length === 1 && root.children[0].type === 'folder') {
		return [root.children[0]]
	}

	// Handle case where no valid nodes were created
	if (root.children?.length === 0) {
		return []
	}

	return root.children || []
}

// Sort children alphabetically
function sortChildren(nodes: FolderNode[]) {
	for (const node of nodes) {
		if (node.type === 'folder' && node.children) {
			node.children.sort((a, b) => {
				if (a.type !== b.type) {
					return a.type === 'folder' ? -1 : 1
				}
				return a.name.localeCompare(b.name)
			})
			sortChildren(node.children)
		}
	}
}

function hasFileExtension(fileName: string): boolean {
	for (const ext of FILE_EXTENSIONS) {
		if (fileName.endsWith(ext)) return true
	}
	return false
}

/**
 * Creates a physical directory and file structure from a FolderNode structure.
 * @param structure - The FolderNode representing the directory/file structure.
 * @param base - The base directory path where the structure will be created (default: '.').
 * @param parentPath - The parent path for recursive calls (default: '').
 * @returns A Promise that resolves when the structure is created.
 * @example
 * ```typescript
 * const structure = {
 *   type: 'folder',
 *   name: 'project',
 *   children: [
 *     {
 *       type: 'folder',
 *       name: 'src',
 *       children: [{ type: 'file', name: 'index.ts' }]
 *     },
 *     { type: 'file', name: 'package.json' }
 *   ]
 * };
 * await createStructure(structure, './output');
 * // Creates:
 * // ./output/project
 * // ./output/project/src
 * // ./output/project/src/index.ts
 * // ./output/project/package.json
 * ```
 */
export async function createStructure(
	structure: FolderNode,
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
