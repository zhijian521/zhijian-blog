import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the project root `blog/` directory.
	loader: glob({ base: './blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter and normalize old project metadata fields.
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			excerpt: z.string().optional(),
			pubDate: z.coerce.date().optional(),
			date: z.coerce.date().optional(),
			updatedDate: z.coerce.date().optional(),
			update: z.coerce.date().optional(),
			tags: z.array(z.string()).optional(),
			category: z.string().optional(),
			id: z.string().trim().min(1),
			sticky: z.union([z.boolean(), z.number()]).optional(),
			heroImage: image().optional(),
		})
		.refine((data) => Boolean(data.pubDate ?? data.date), {
			message: '`pubDate` or `date` is required',
			path: ['pubDate'],
		})
		.transform((data) => ({
			id: data.id,
			title: data.title,
			description: data.description?.trim() || data.excerpt?.trim() || data.title,
			pubDate: data.pubDate ?? data.date ?? new Date('1970-01-01'),
			updatedDate: data.updatedDate ?? data.update,
			sticky:
				typeof data.sticky === 'number'
					? data.sticky
					: data.sticky
						? 1
						: 0,
			tags: data.tags ?? [],
			category: data.category,
			heroImage: data.heroImage,
		})),
});

export const collections = { blog };
