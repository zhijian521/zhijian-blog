import type { CollectionEntry } from 'astro:content';
import { encodeCategoryPath as encodeCategoryPathFromDirectory } from './categoryDirectory';

type BlogPost = CollectionEntry<'blog'>;

type TaxonomyItem = {
	name: string;
	count: number;
};

const TAXONOMY_LOCALE = 'zh-CN';

const sortTaxonomyItems = (a: TaxonomyItem, b: TaxonomyItem): number =>
	b.count - a.count || a.name.localeCompare(b.name, TAXONOMY_LOCALE);

function collectTaxonomy(
	posts: BlogPost[],
	getNames: (post: BlogPost) => string[]
): TaxonomyItem[] {
	const counts = new Map<string, number>();

	for (const post of posts) {
		for (const name of getNames(post)) {
			counts.set(name, (counts.get(name) ?? 0) + 1);
		}
	}

	return [...counts.entries()].map(([name, count]) => ({ name, count })).sort(sortTaxonomyItems);
}

export function encodeTag(tag: string): string {
	return encodeURIComponent(tag);
}

export function getPostPath(postId: string): string {
	return `/article/${encodeURIComponent(postId)}`;
}

export function encodeCategoryPath(category: string): string {
	return encodeCategoryPathFromDirectory(category);
}

export function sortPostsByPriority(posts: BlogPost[]): BlogPost[] {
	return [...posts].sort((a, b) => {
		if (a.data.sticky !== b.data.sticky) {
			return b.data.sticky - a.data.sticky;
		}

		return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
	});
}

export function collectTags(posts: BlogPost[]): TaxonomyItem[] {
	return collectTaxonomy(posts, (post) => post.data.tags ?? []);
}

export function collectCategories(posts: BlogPost[]): TaxonomyItem[] {
	return collectTaxonomy(posts, (post) => (post.data.category ? [post.data.category] : []));
}
