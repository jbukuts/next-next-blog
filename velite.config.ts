import { defineConfig, s, defineSchema } from 'velite';
import fs from 'fs';

const timestamp = defineSchema(() =>
  s
    .custom<string | undefined>((i) => i === undefined || typeof i === 'string')
    .transform<string>((_value, { meta }) => {
      const stats = fs.statSync(meta.path);
      return stats.mtime.toISOString();
    })
);

export default defineConfig({
  root: './content',
  collections: {
    education: {
      name: 'Education',
      pattern: 'education.yaml',
      schema: s.object({
        uni: s.string(),
        degree: s.string(),
        city: s.string(),
        state: s.string().length(2),
        gpa: s.number().optional(),
        time_range: s.tuple([s.isodate(), s.union([s.isodate(), s.null()])])
      })
    },
    work_history: {
      name: 'WorkHistory',
      pattern: 'work-history.yaml',
      schema: s.object({
        title: s.string(),
        company: s.string(),
        city: s.string(),
        state: s.string().length(2),
        time_range: s.tuple([s.isodate(), s.union([s.isodate(), s.null()])]),
        desc: s.string().array(),
        urls: s
          .object({
            name: s.string(),
            url: s.string().url()
          })
          .array()
          .optional()
      })
    },
    publications: {
      name: 'Publications',
      pattern: 'publications.yaml',
      schema: s.object({
        title: s.string(),
        date_published: s.isodate(),
        publisher: s.string(),
        journal: s.string().optional(),
        authors: s
          .object({ name: s.string(), email: s.string() })
          .array()
          .optional(),
        desc: s.string(),
        url: s.string().url()
      })
    },
    patents: {
      name: 'Patents',
      pattern: 'patents.yaml',
      schema: s.object({
        title: s.string(),
        patent_number: s.string(),
        date_issued: s.isodate(),
        inventors: s
          .object({ name: s.string(), email: s.string() })
          .array()
          .optional(),
        status: s.enum(['pending', 'issued']),
        desc: s.string().optional(),
        url: s.string().url()
      })
    },
    projects: {
      name: 'Projects',
      pattern: 'projects.yaml',
      schema: s.object({
        name: s.string(),
        desc: s.string()
      })
    },
    posts: {
      name: 'Post',
      pattern: 'posts/**/*.{md,mdx}',
      schema: s
        .object({
          toc: s.toc({ maxDepth: 3 }),
          desc: s.string(),
          tags: s.string().array(),
          created: s.isodate(),
          updated: timestamp(),
          file_path: s.path({ removeIndex: true }),
          content: s.raw(),
          excerpt: s.excerpt({ length: 250 }),
          metadata: s.metadata()
        })
        .transform((data) => {
          const { file_path, toc, excerpt, metadata } = data;

          const title = toc[0].title;
          const slug = file_path.split('/')[1];

          return {
            ...data,
            slug,
            readingTime: metadata.readingTime,
            title,
            excerpt: excerpt.substring(title.length).trim() + '...'
          };
        })
    }
  }
});
