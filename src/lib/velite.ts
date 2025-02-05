import { posts } from '#velite';

const POST_SORTED_DESC = posts.toSorted(
  (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
);

const SLUG_MAP = POST_SORTED_DESC.reduce(
  (acc, curr, idx) => {
    return {
      ...acc,
      [curr.slug]: idx
    };
  },
  {} as Record<string, number>
);

export { POST_SORTED_DESC, SLUG_MAP };
