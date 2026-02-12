import type { CollectionEntry } from 'astro:content';
import { encodeCategoryPath as encodeCategoryPathFromDirectory } from './categoryDirectory';

type BlogPost = CollectionEntry<'blog'>;

type TaxonomyItem = {
	name: string;
	count: number;
};

export function encodeTag(tag: string): string {
	return encodeURIComponent(tag);
}

export function getPostPath(postId: string): string {
	return `/${encodeURIComponent(postId)}`;
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
