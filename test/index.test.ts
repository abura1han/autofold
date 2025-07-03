import { expect, test } from 'bun:test'
import { parseTree } from '../src/utils'

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
├── examples
├── tests
├── .bunfig.toml
├── main.ts
└── tsconfig.json
`

test('should parse tree structure into correct JSON array', () => {
	const result = parseTree(treeInput)

	expect(result).toEqual([
		{
			type: 'folder',
			name: 'autofold',
			children: [
				{
					type: 'folder',
					name: 'packages',
					children: [
						{ type: 'folder', name: 'core', children: [] },
						{ type: 'folder', name: 'cli', children: [] },
						{ type: 'folder', name: 'config', children: [] },
						{ type: 'folder', name: 'types', children: [] },
						{
							type: 'folder',
							name: 'modules',
							children: [
								{ type: 'folder', name: 'proxy', children: [] },
								{ type: 'folder', name: 'static', children: [] },
								{ type: 'folder', name: 'tls', children: [] },
								{ type: 'folder', name: 'logging', children: [] },
							],
						},
					],
				},
				{ type: 'folder', name: 'examples', children: [] },
				{ type: 'folder', name: 'tests', children: [] },
				{ type: 'file', name: '.bunfig.toml' },
				{ type: 'file', name: 'main.ts' },
				{ type: 'file', name: 'tsconfig.json' },
			],
		},
		{
			type: 'folder',
			name: 'packages',
			children: [
				{ type: 'folder', name: 'core', children: [] },
				{ type: 'folder', name: 'cli', children: [] },
				{ type: 'folder', name: 'config', children: [] },
				{ type: 'folder', name: 'types', children: [] },
				{
					type: 'folder',
					name: 'modules',
					children: [
						{ type: 'folder', name: 'proxy', children: [] },
						{ type: 'folder', name: 'static', children: [] },
						{ type: 'folder', name: 'tls', children: [] },
						{ type: 'folder', name: 'logging', children: [] },
					],
				},
			],
		},
		{ type: 'folder', name: 'core', children: [] },
		{ type: 'folder', name: 'cli', children: [] },
		{ type: 'folder', name: 'config', children: [] },
		{ type: 'folder', name: 'types', children: [] },
		{
			type: 'folder',
			name: 'modules',
			children: [
				{ type: 'folder', name: 'proxy', children: [] },
				{ type: 'folder', name: 'static', children: [] },
				{ type: 'folder', name: 'tls', children: [] },
				{ type: 'folder', name: 'logging', children: [] },
			],
		},
		{ type: 'folder', name: 'proxy', children: [] },
		{ type: 'folder', name: 'static', children: [] },
		{ type: 'folder', name: 'tls', children: [] },
		{ type: 'folder', name: 'logging', children: [] },
		{ type: 'folder', name: 'examples', children: [] },
		{ type: 'folder', name: 'tests', children: [] },
		{ type: 'file', name: '.bunfig.toml' },
		{ type: 'file', name: 'main.ts' },
		{ type: 'file', name: 'tsconfig.json' },
	])
})
