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
└── tsconfig.json
`

test('should parse tree structure into correct paths', () => {
	const result = parseTree(treeInput)

	expect(result).toEqual([
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
		'autofold/tsconfig.json',
	])
})
