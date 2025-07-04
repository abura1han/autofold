import { expect, test } from 'bun:test'
import type { FolderNode, NestedTree } from '../src/types'
import {
	createDirectoryTree,
	parsePathSegments,
	transformFlatObject,
	transformNestedTree,
	transformTreeString,
} from '../src/utils'

// Inputs
const treeInput = `
/autofold
├── packages
│   ├── core
│   ├── cli
│   ├── config
│   ├── types
│   └── modules
│       ├── proxy
│       ├── static
│       ├── tls
│       └── logging
├── examples // This is example
├── tests # This is test
├── .bunfig.toml
├── main.ts
└── tsconfig.json
`

const pathsArrayInput = [
	'autofold',
	'autofold/packages',
	'autofold/packages/core',
	'autofold/packages/cli',
	'autofold/packages/config',
	'autofold/packages/types',
	'autofold/packages/modules',
	'autofold/packages/modules/proxy',
	'autofold/packages/modules/static',
	'autofold/packages/modules/tls',
	'autofold/packages/modules/logging',
	'autofold/examples',
	'autofold/tests',
	'autofold/.bunfig.toml',
	'autofold/main.ts',
	'autofold/tsconfig.json',
]

const nestedTreeInput = {
	autofold: {
		'.bunfig.toml': null,
		'tsconfig.json': null,
		'main.ts': null,
		packages: {
			core: {},
			cli: {},
			config: {},
			types: {},
			modules: {
				proxy: {},
				static: {},
				tls: {},
				logging: {},
			},
		},
		examples: {},
		tests: {},
	},
} as NestedTree

const pathSegmentsInput = [
	['autofold'],
	['autofold', 'packages'],
	['autofold', 'packages', 'core'],
	['autofold', 'packages', 'cli'],
	['autofold', 'packages', 'config'],
	['autofold', 'packages', 'types'],
	['autofold', 'packages', 'modules'],
	['autofold', 'packages', 'modules', 'proxy'],
	['autofold', 'packages', 'modules', 'static'],
	['autofold', 'packages', 'modules', 'tls'],
	['autofold', 'packages', 'modules', 'logging'],
	['autofold', 'examples'],
	['autofold', 'tests'],
	['autofold', '.bunfig.toml'],
	['autofold', 'main.ts'],
	['autofold', 'tsconfig.json'],
]

const flatObjectInput = {
	autofold: true,
	'autofold/.bunfig.toml': true,
	'autofold/main.ts': true,
	'autofold/tsconfig.json': true,
	'autofold/packages': true,
	'autofold/packages/core': true,
	'autofold/packages/cli': true,
	'autofold/packages/config': true,
	'autofold/packages/types': true,
	'autofold/packages/modules': true,
	'autofold/packages/modules/proxy': true,
	'autofold/packages/modules/static': true,
	'autofold/packages/modules/tls': true,
	'autofold/packages/modules/logging': true,
	'autofold/examples': true,
	'autofold/tests': true,
}

const expectedOutput: FolderNode[] = [
	{
		type: 'folder',
		name: 'autofold',
		children: [
			{ type: 'folder', name: 'examples', children: [] },
			{
				type: 'folder',
				name: 'packages',
				children: [
					{ type: 'folder', name: 'cli', children: [] },
					{ type: 'folder', name: 'config', children: [] },
					{ type: 'folder', name: 'core', children: [] },
					{
						type: 'folder',
						name: 'modules',
						children: [
							{ type: 'folder', name: 'logging', children: [] },
							{ type: 'folder', name: 'proxy', children: [] },
							{ type: 'folder', name: 'static', children: [] },
							{ type: 'folder', name: 'tls', children: [] },
						],
					},
					{ type: 'folder', name: 'types', children: [] },
				],
			},
			{ type: 'folder', name: 'tests', children: [] },
			{ type: 'file', name: '.bunfig.toml' },
			{ type: 'file', name: 'main.ts' },
			{ type: 'file', name: 'tsconfig.json' },
		],
	},
]

test('should parse tree structure string', () => {
	const result = transformTreeString(treeInput)

	expect(result).toEqual(expectedOutput)
})

test('should transform flat object', () => {
	const result = transformFlatObject(flatObjectInput)

	expect(result).toEqual(expectedOutput)
})

test('should transform nested tree object', () => {
	const result = transformNestedTree(nestedTreeInput)

	expect(result).toEqual(expectedOutput)
})

test('should transform path segments array', () => {
	const result = parsePathSegments(pathSegmentsInput)

	expect(result).toEqual(expectedOutput)
})

test('should transform path tree array', () => {
	const result = createDirectoryTree(pathsArrayInput)

	expect(result).toEqual(expectedOutput)
})
