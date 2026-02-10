import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

type TaxonomyItem = {
	name: string;
	count: number;
};

export type CategoryTreeItem = {
	name: string;
	path: string;
	depth: number;
	count: number;
};

export function encodeTag(tag: string): string {
	return encodeURIComponent(tag);
}

export function encodeCategoryPath(category: string): string {
	return category
		.split('/')
		.map((segment) => segment.trim())
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

export function sortPostsByPriority(posts: BlogPost[]): BlogPost[] {
	return [...posts].sort((a, b) => {
		if (a.data.sticky !== b.data.sticky) {
			return a.data.sticky ? -1 : 1;
		}

		return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
	});
}

export function collectTags(posts: BlogPost[]): TaxonomyItem[] {
	const counts = new Map<string, number>();

	for (const post of posts) {
		for (const tag of post.data.tags ?? []) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}

	return [...counts.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function collectCategories(posts: BlogPost[]): TaxonomyItem[] {
	const counts = new Map<string, number>();

	for (const post of posts) {
		if (!post.data.category) {
			continue;
		}

		counts.set(post.data.category, (counts.get(post.data.category) ?? 0) + 1);
	}

	return [...counts.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function collectCategoryPrefixes(posts: BlogPost[]): Map<string, number> {
	const prefixCounts = new Map<string, number>();

	for (const post of posts) {
		if (!post.data.category) {
			continue;
		}

		const segments = post.data.category
			.split('/')
			.map((segment) => segment.trim())
			.filter(Boolean);

		for (let index = 0; index < segments.length; index += 1) {
			const prefix = segments.slice(0, index + 1).join('/');
			prefixCounts.set(prefix, (prefixCounts.get(prefix) ?? 0) + 1);
		}
	}

	return prefixCounts;
}

export function collectCategoryTree(posts: BlogPost[]): CategoryTreeItem[] {
	const prefixCounts = collectCategoryPrefixes(posts);
	const childrenMap = new Map<string, Set<string>>();

	for (const path of prefixCounts.keys()) {
		const segments = path.split('/');
		const parent = segments.length > 1 ? segments.slice(0, -1).join('/') : '';

		if (!childrenMap.has(parent)) {
			childrenMap.set(parent, new Set());
		}

		childrenMap.get(parent)?.add(path);
	}

	const rows: CategoryTreeItem[] = [];

	const walk = (parentPath: string, depth: number) => {
		const children = [...(childrenMap.get(parentPath) ?? [])].sort((a, b) => {
			const aName = a.split('/').at(-1) ?? a;
			const bName = b.split('/').at(-1) ?? b;
			return aName.localeCompare(bName, 'zh-CN');
		});

		for (const child of children) {
			rows.push({
				name: child.split('/').at(-1) ?? child,
				path: child,
				depth,
				count: prefixCounts.get(child) ?? 0,
			});

			walk(child, depth + 1);
		}
	};

	walk('', 0);

	return rows;
}
