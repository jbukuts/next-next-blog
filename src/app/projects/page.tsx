import CenterWrapper from '#/components/center-wrapper';
import Headings from '#/components/ui/heading';
import { Link } from '#/components/ui/link';
import { formatDate } from 'date-fns';
import { z } from 'zod';
import colors from 'tailwindcss/colors';
import { projects } from '#velite';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Octokit } from 'octokit';
import { Metadata } from 'next';
import createMetadata from '#/lib/create-metadata';

const PROJECT_MAP = projects.reduce(
  (acc, curr, idx) => ({ ...acc, [curr.name]: idx }),
  {} as Record<string, number>
);

const COLOR_MAP: Record<string, string> = {
  javascript: colors.yellow[500],
  typescript: colors.blue[500],
  html: colors.orange[500],
  shell: colors.lime[500],
  css: colors.fuchsia[500],
  scss: colors.rose[500],
  vue: colors.emerald[500],
  rust: colors.red[500],
  c: colors.indigo[700],
  python: colors.indigo[400]
};

const { GH_TOKEN } = process.env;
const USERNAME = 'jbukuts';

export const metadata: Metadata = createMetadata({
  title: 'Projects',
  description: 'List of my personal projects',
  openGraph: {
    title: 'Projects',
    url: '/projects',
    description: 'List of my personal projects'
  },
  twitter: {
    title: 'Projects',
    description: 'List of my personal projects'
  }
});

const octokit = new Octokit({
  auth: GH_TOKEN
});

const gqlResSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    homepageUrl: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    repositoryTopics: z.object({
      nodes: z
        .object({
          topic: z.object({ name: z.string() })
        })
        .array()
    }),
    languages: z.object({
      totalSize: z.number(),
      edges: z
        .object({
          size: z.number(),
          node: z.object({ name: z.string(), color: z.string() })
        })
        .array()
    }),
    primaryLanguage: z
      .object({
        name: z.string(),
        color: z.string()
      })
      .nullable()
  })
  .array();

async function getPinnedRepos() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await octokit.graphql(
      `{
        user(login: "${USERNAME}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                description
                url
                homepageUrl
                createdAt
                updatedAt
                repositoryTopics(first:10) {
                  nodes {
                    ... on RepositoryTopic {
                      topic { name }
                    }
                  }
                }
                primaryLanguage {
                  name
                  color
                }
                languages(first: 10) {
                  totalSize
                  edges {
                    size
                    node {
                      name
                      color
                    }
                  }
                }
              }
          }
          }
        }
      }`
    );

    const { error, data } = gqlResSchema.safeParse(
      response.user.pinnedItems.nodes
    );

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching pinned repositories:', error);
    return null;
  }
}

export default async function ProjectsPage() {
  const pinned = await getPinnedRepos();
  if (pinned === null) throw Error('Issue getting pinned repos');

  return (
    <CenterWrapper asChild>
      <main className='flex flex-col gap-10'>
        {pinned.map(async (repo) => {
          const {
            name,
            description,
            url,
            homepageUrl,
            createdAt,
            updatedAt,
            languages,
            repositoryTopics
          } = repo;

          const desc =
            PROJECT_MAP[name] !== undefined
              ? projects[PROJECT_MAP[name]].desc
              : description;

          return (
            <div key={name} className='grid grid-cols-2 gap-y-2'>
              <Headings.H2 className='col-span-2 col-start-1 row-start-1 text-center text-3xl tracking-tight md:col-span-1 md:text-left'>
                {name}
              </Headings.H2>
              <p className='text-accent col-span-2 col-start-1 text-center font-serif text-sm md:col-span-1 md:text-left'>
                created {formatDate(createdAt, 'LLL d yyyy')}, updated{' '}
                {formatDate(updatedAt, 'LLL d yyyy')}
              </p>
              <div className='col-span-2 col-start-1 row-start-3 flex h-fit flex-wrap justify-center gap-1.5 md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-1 md:justify-end'>
                {repositoryTopics.nodes.map(({ topic }) => (
                  <span
                    key={topic.name}
                    className='border-foreground rounded-md border px-1.5 py-1 text-xs'>
                    {topic.name}
                  </span>
                ))}
              </div>
              <div className='col-span-2 row-start-4 space-y-1.5 text-center md:row-start-3 md:text-left'>
                {
                  (
                    await compileMDX({
                      source: desc,
                      options: {
                        mdxOptions: {
                          remarkPlugins: [remarkGfm, remarkBreaks]
                        }
                      },
                      components: {
                        a: Link
                      }
                    })
                  ).content
                }
              </div>
              {languages.edges.length > 0 && (
                <div className='col-span-2 col-start-1 flex flex-wrap justify-center gap-2 md:justify-start'>
                  {languages.edges.map((l, idx) => (
                    <div
                      key={idx}
                      className='flex flex-nowrap items-center gap-1'>
                      <div
                        className='size-3 rounded-full'
                        style={{
                          background:
                            COLOR_MAP[l.node.name.toLowerCase()] ?? l.node.color
                        }}
                      />
                      <p className='text-xs'>{l.node.name}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className='col-span-2 col-start-1 space-x-2 text-center md:text-left'>
                {[
                  { url, text: 'source code' },
                  { url: homepageUrl, text: 'project homepage' }
                ].map(
                  ({ url, text }, idx) =>
                    url && (
                      <Link
                        key={idx}
                        href={url}
                        target='_blank'
                        rel='noreferrer'
                        className='font-serif font-normal italic'>
                        {text}
                      </Link>
                    )
                )}
              </div>
            </div>
          );
        })}
      </main>
    </CenterWrapper>
  );
}
