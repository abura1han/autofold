import { expect, test } from 'bun:test'
import { parseTree } from '../src'

const treeInput = `
/highx
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
		'highx',
		'highx/packages',
		'highx/packages/core',
		'highx/packages/cli',
		'highx/packages/config',
		'highx/packages/types',
		'highx/packages/modules',
		'highx/packages/modules/proxy',
		'highx/packages/modules/static',
		'highx/packages/modules/tls',
		'highx/packages/modules/logging',
		'highx/examples',
		'highx/tests',
		'highx/.bunfig.toml',
		'highx/tsconfig.json',
	])
})
