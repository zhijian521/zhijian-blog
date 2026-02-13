import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

export type CategoryDirectoryItem = {
	name: string;
	path: string;
	depth: number;
	parentPath: string | null;
	directCount: number;
	totalCount: number;
};

type MutableCategoryNode = CategoryDirectoryItem & {
	children: Set<string>;
};

export function normalizeCategoryPath(rawCategory: string): string {
	return rawCategory
		.split('/')
		.map((segment) => segment.trim())
		.filter(Boolean)
		.join('/');
}

export function encodeCategoryPath(category: string): string {
	return normalizeCategoryPath(category)
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

export function buildCategoryDirectory(posts: BlogPost[]): CategoryDirectoryItem[] {
	const nodeMap = new Map<string, MutableCategoryNode>();
	const childrenMap = new Map<string | null, MutableCategoryNode[]>();

	const ensureNode = (path: string): MutableCategoryNode => {
		const existingNode = nodeMap.get(path);
		if (existingNode) {
			return existingNode;
		}

		const segments = path.split('/').filter(Boolean);
		const parentPath = segments.length > 1 ? segments.slice(0, -1).join('/') : null;
		const node: MutableCategoryNode = {
			name: segments.at(-1) ?? path,
			path,
			depth: Math.max(0, segments.length - 1),
			parentPath,
			directCount: 0,
			totalCount: 0,
			children: new Set<string>(),
		};

		nodeMap.set(path, node);

		if (parentPath) {
			ensureNode(parentPath).children.add(path);
		}

		return node;
	};

	for (const post of posts) {
		const normalizedCategory = normalizeCategoryPath(post.data.category ?? '');
		if (!normalizedCategory) {
			continue;
		}

		const segments = normalizedCategory.split('/');

		for (let index = 0; index < segments.length; index += 1) {
			const path = segments.slice(0, index + 1).join('/');
			const node = ensureNode(path);
			node.totalCount += 1;

			if (index === segments.length - 1) {
				node.directCount += 1;
			}
		}
	}

	for (const node of nodeMap.values()) {
		const siblings = childrenMap.get(node.parentPath);
		if (siblings) {
			siblings.push(node);
			continue;
		}

		childrenMap.set(node.parentPath, [node]);
	}

	for (const children of childrenMap.values()) {
		children.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
	}

	const rows: CategoryDirectoryItem[] = [];

	const walk = (parentPath: string | null) => {
		const children = childrenMap.get(parentPath) ?? [];

		for (const child of children) {
			rows.push({
				name: child.name,
				path: child.path,
				depth: child.depth,
				parentPath: child.parentPath,
				directCount: child.directCount,
				totalCount: child.totalCount,
			});

			walk(child.path);
		}
	};

	walk(null);

	return rows;
}

export function buildCategoryBreadcrumb(categoryPath: string) {
	const normalizedPath = normalizeCategoryPath(categoryPath);
	const segments = normalizedPath.split('/').filter(Boolean);

	return segments.map((segment, index) => ({
		name: segment,
		path: segments.slice(0, index + 1).join('/'),
	}));
}

export function filterPostsByCategory(
	posts: BlogPost[],
	categoryPath: string,
	mode: 'direct' | 'tree'
): BlogPost[] {
	const normalizedPath = normalizeCategoryPath(categoryPath);
	if (!normalizedPath) {
		return [];
	}

	const prefix = `${normalizedPath}/`;

	return posts.filter((post) => {
		const postCategory = normalizeCategoryPath(post.data.category ?? '');
		if (!postCategory) {
			return false;
		}

		if (mode === 'direct') {
			return postCategory === normalizedPath;
		}

		return postCategory === normalizedPath || postCategory.startsWith(prefix);
	});
}
