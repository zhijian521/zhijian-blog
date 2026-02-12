import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	collectCategories,
	collectTags,
	encodeCategoryPath,
	encodeTag,
	getPostPath,
	sortPostsByPriority,
} from '../src/utils/blogTaxonomy';
import {
	buildCategoryBreadcrumb,
	buildCategoryDirectory,
	encodeCategoryPath as encodeCategoryPathFromDirectory,
	filterPostsByCategory,
	normalizeCategoryPath,
} from '../src/utils/categoryDirectory';

type TestPost = {
	id: string;
	data: {
		id: string;
		title: string;
		description: string;
		pubDate: Date;
		updatedDate?: Date;
		sticky: number;
		tags: string[];
		category?: string;
	};
};

type TestPostInput = {
	id: string;
	title: string;
	pubDate: string;
	description?: string;
	sticky?: number;
	tags?: string[];
	category?: string;
};

const makePost = (input: TestPostInput): TestPost => ({
	id: input.id,
	data: {
		id: input.id,
		title: input.title,
		description: input.description ?? input.title,
		pubDate: new Date(input.pubDate),
		sticky: input.sticky ?? 0,
		tags: input.tags ?? [],
		category: input.category,
	},
});

const posts = [
	makePost({
		id: 'high-sticky',
		title: 'A',
		pubDate: '2026-02-01',
		sticky: 5,
		tags: ['工具', '前端'],
		category: '开发/前端',
	}),
	makePost({
		id: 'new-no-sticky',
		title: 'B',
		pubDate: '2026-02-10',
		sticky: 0,
		tags: ['前端'],
		category: '开发/前端/工程优化',
	}),
	makePost({
		id: 'low-sticky',
		title: 'C',
		pubDate: '2026-01-20',
		sticky: 1,
		tags: ['生活'],
		category: '生活',
	}),
	makePost({
		id: 'without-category',
		title: 'D',
		pubDate: '2026-01-15',
		tags: ['工具'],
	}),
] as unknown as Parameters<typeof sortPostsByPriority>[0];

describe('blog taxonomy utils', () => {
	it('sorts by sticky first then pubDate', () => {
		const sorted = sortPostsByPriority(posts);
		assert.equal(sorted[0].data.id, 'high-sticky');
		assert.equal(sorted[1].data.id, 'low-sticky');
		assert.equal(sorted[2].data.id, 'new-no-sticky');
	});

	it('collects tags and categories with counts', () => {
		const tags = collectTags(posts);
		const tagMap = new Map(tags.map((item) => [item.name, item.count]));
		assert.equal(tagMap.get('前端'), 2);
		assert.equal(tagMap.get('工具'), 2);
		assert.equal(tagMap.get('生活'), 1);

		const categories = collectCategories(posts);
		const categoryMap = new Map(categories.map((item) => [item.name, item.count]));
		assert.equal(categoryMap.get('开发/前端'), 1);
		assert.equal(categoryMap.get('开发/前端/工程优化'), 1);
		assert.equal(categoryMap.get('生活'), 1);
	});

	it('encodes tag/post/category links consistently', () => {
		assert.equal(encodeTag('技术 博客'), '%E6%8A%80%E6%9C%AF%20%E5%8D%9A%E5%AE%A2');
		assert.equal(getPostPath('9byt3r60'), '/article/9byt3r60');
		assert.equal(
			encodeCategoryPath('开发/地图可视化'),
			encodeCategoryPathFromDirectory('开发/地图可视化')
		);
	});
});

describe('category directory utils', () => {
	it('normalizes category path with extra slashes and spaces', () => {
		assert.equal(normalizeCategoryPath(' 开发 / 前端 / 工程优化 '), '开发/前端/工程优化');
	});

	it('builds directory counts and breadcrumb', () => {
		const directory = buildCategoryDirectory(posts);
		const frontend = directory.find((item) => item.path === '开发/前端');
		const frontendOptimize = directory.find((item) => item.path === '开发/前端/工程优化');

		assert.ok(frontend);
		assert.ok(frontendOptimize);
		assert.equal(frontend?.directCount, 1);
		assert.equal(frontend?.totalCount, 2);
		assert.equal(frontendOptimize?.directCount, 1);

		const breadcrumb = buildCategoryBreadcrumb('开发/前端/工程优化');
		assert.deepEqual(breadcrumb, [
			{ name: '开发', path: '开发' },
			{ name: '前端', path: '开发/前端' },
			{ name: '工程优化', path: '开发/前端/工程优化' },
		]);
	});

	it('filters direct and tree category posts correctly', () => {
		const directPosts = filterPostsByCategory(posts, '开发/前端', 'direct');
		const treePosts = filterPostsByCategory(posts, '开发/前端', 'tree');

		assert.equal(directPosts.length, 1);
		assert.equal(treePosts.length, 2);
		assert.ok(treePosts.some((post) => post.data.id === 'new-no-sticky'));
	});
});
