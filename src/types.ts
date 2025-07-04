export type FolderNode = {
	type: 'folder' | 'file'
	name: string
	children?: FolderNode[]
}

export type NestedTree = {
	[key: string]: null | string | NestedTree
}
