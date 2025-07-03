# Setro

Setro is a lightweight utility for creating directory structures and files from a tree-like string representation. It parses a tree structure and generates corresponding directories and files in the filesystem.

## Installation

Install Setro using Bun:

```bash
bun install setro
```

## Usage

Run Setro with a tree string or a file containing the tree structure:

```bash
setro <tree-string-or-file>
```

### Example

Given a file `tree.txt` with the following content:

```
project
├── src
│   └── main.js
├── config
│   └── settings.json
└── README.md
```

Run:

```bash
setro ./tree.txt
```

This will create:

- A `project` directory
- A `src` directory with an empty `main.js` file
- A `config` directory with an empty `settings.json` file
- An empty `README.md` file

Alternatively, provide the tree structure directly:

```bash
setro "project\n├── src\n│   └── main.js\n├── config\n│   └── settings.json\n└── README.md"
```

### Features

- Parses tree-like string representations of file structures
- Creates directories and empty files (`.json` and `.toml` files are supported)
- Skips existing directories to avoid overwriting
- Ignores comments (lines with `#`) and empty lines
- Handles nested structures with proper indentation

## API

### `parseTree(tree: string): string[]`

Parses a tree string into an array of file and directory paths.

- **tree**: A string representing the tree structure.
- **Returns**: An array of paths (e.g., `["project/src/main.js", "project/config/settings.json"]`).

### `createStructure(paths: string[], base: string = '.'): Promise<void>`

Creates directories and files based on the provided paths.

- **paths**: Array of file and directory paths.
- **base**: Base directory to create the structure in (defaults to current directory).
- **Returns**: A promise that resolves when the structure is created.

## Example Code

```javascript
#!/usr/bin/env bun
import { parseTree, createStructure } from 'setro';

const tree = `
project
├── src
│   └── main.js
├── config
│   └── settings.json
└── README.md
`;

const paths = parseTree(tree);
await createStructure(paths, './output');
```

## Author

- @abura1han

## License

MIT License
