# Autofold

Autofold is a TypeScript library and CLI tool designed to create directory and file structures from various input formats. It supports parsing directory trees from ASCII tree strings, nested JSON objects, flat objects, path segment arrays, and simple path lists, then generates the corresponding filesystem structure.

[View the source code on GitHub](https://github.com/abura1han/autofold)

## Installation

Install Autofold using Bun:

```bash
bun add autofold@latest
```

Ensure you have [Bun](https://bun.sh/) installed to run the CLI or use the library in your projects.

## CLI Usage

The Autofold CLI allows you to generate directory structures from various input formats, either provided directly or via a file.

### Command

```bash
bunx autofold@latest [-f <format>] <tree-string-or-file>
```

### Options

- `-f <format>`: Specify the input format. Supported formats:
  - `tree`: ASCII tree string (default)
  - `nested`: Nested JSON object
  - `flat`: Flat JSON object with boolean values
  - `segments`: Array of path segment arrays
  - `paths`: Array of path strings
- `--help`: Display help information

### Examples

1. **Tree String Input**:
   ```bash
   autofold -f tree "./project\n├── src\n│   ├── index.ts\n│   └── utils\n│       └── helper.ts\n└── package.json"
   ```
   Creates:
   ```
   project/
   ├── src/
   │   ├── index.ts
   │   └── utils/
   │       └── helper.ts
   └── package.json
   ```

2. **Nested JSON Input**:
   ```bash
   autofold -f nested '{"project": {".bunfig.toml": null, "src": {"index.ts": null, "utils": {"helper.ts": null}}}}'
   ```
   Creates the same structure as above with `.bunfig.toml`.

3. **Flat JSON File**:
   ```bash
   autofold -f flat ./flat.json
   ```
   Where `flat.json` contains:
   ```json
   {
     "project": true,
     "project/.bunfig.toml": true,
     "project/src": true,
     "project/src/index.ts": true,
     "project/src/utils": true,
     "project/src/utils/helper.ts": true
   }
   ```

4. **Path Segments Input**:
   ```bash
   autofold -f segments '[["project"], ["project", ".bunfig.toml"], ["project", "src"], ["project", "src", "index.ts"], ["project", "src", "utils"], ["project", "src", "utils", "helper.ts"]]'
   ```

5. **Paths Input**:
   ```bash
   autofold -f paths '["project/.bunfig.toml", "project/src/index.ts", "project/src/utils/helper.ts"]'
   ```

### Notes
- Input can be provided as a string or a file path.
- The CLI creates the structure in the current working directory, using the root folder name from the input (or `output` if the name starts with `/`).
- Files are created empty; folders are created recursively.

## Library Usage

Autofold can be used programmatically in TypeScript or JavaScript projects to parse and create directory structures.

### Available Functions

#### `transformTreeString(input: string): FolderNode[]`
Parses an ASCII tree string into a `FolderNode` array.

**Example**:
```typescript
import { transformTreeString } from 'autofold';

const treeString = `
project
├── src
│   ├── index.ts
│   └── utils
│       └── helper.ts
└── package.json
`;
const nodes = transformTreeString(treeString);
```

#### `transformNestedTree(input: NestedTree): FolderNode[]`
Parses a nested JSON object into a `FolderNode` array.

**Example**:
```typescript
import { transformNestedTree } from 'autofold';

const nestedTree = {
  project: {
    '.bunfig.toml': null,
    src: {
      'index.ts': null,
      utils: {
        'helper.ts': null
      }
    }
  }
};
const nodes = transformNestedTree(nestedTree);
```

#### `transformFlatObject(input: Record<string, boolean>): FolderNode[]`
Parses a flat object with boolean values into a `FolderNode` array.

**Example**:
```typescript
import { transformFlatObject } from 'autofold';

const flatObject = {
  'project': true,
  'project/.bunfig.toml': true,
  'project/src': true,
  'project/src/index.ts': true,
  'project/src/utils': true,
  'project/src/utils/helper.ts': true
};
const nodes = transformFlatObject(flatObject);
```

#### `parsePathSegments(paths: string[][]): FolderNode[]`
Parses an array of path segment arrays into a `FolderNode` array.

**Example**:
```typescript
import { parsePathSegments } from 'autofold';

const pathSegments = [
  ['project'],
  ['project', '.bunfig.toml'],
  ['project', 'src'],
  ['project', 'src', 'index.ts'],
  ['project', 'src', 'utils'],
  ['project', 'src', 'utils', 'helper.ts']
];
const nodes = parsePathSegments(pathSegments);
```

#### `createDirectoryTree(paths: string[]): FolderNode[]`
Parses an array of path strings into a `FolderNode` array.

**Example**:
```typescript
import { createDirectoryTree } from 'autofold';

const paths = [
  'project/.bunfig.toml',
  'project/src/index.ts',
  'project/src/utils/helper.ts'
];
const nodes = createDirectoryTree(paths);
```

#### `createStructure(structure: FolderNode, base?: string, parentPath?: string): Promise<void>`
Creates a physical directory and file structure from a `FolderNode`.

**Example**:
```typescript
import { createStructure, createDirectoryTree } from 'autofold';

const paths = ['project/src/index.ts', 'project/package.json'];
const nodes = createDirectoryTree(paths);
await createStructure(nodes[0], './output');
```

### Types

#### `FolderNode`
```typescript
export type FolderNode = {
  type: 'folder' | 'file';
  name: string;
  children?: FolderNode[];
};
```

#### `NestedTree`
```typescript
export type NestedTree = {
  [key: string]: null | string | NestedTree;
};
```

## Contributing

Contributions are welcome! Please open an issue or pull request on the [GitHub repository](https://github.com/abura1han/autofold).

## License

Autofold is licensed under the MIT License. See the [LICENSE](https://github.com/abura1han/autofold/blob/main/LICENSE) file for details.
