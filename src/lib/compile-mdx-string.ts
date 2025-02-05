import { compileMDX, MDXRemoteProps } from 'next-mdx-remote/rsc';

interface CompileMDXStringOpts {
  components: MDXRemoteProps['components'];
}

export default async function compileMDXString(
  content: string,
  opts?: CompileMDXStringOpts
) {
  const res = await compileMDX({
    source: content,
    options: {
      parseFrontmatter: false
    },
    components: opts?.components ?? {}
  });

  return res.content;
}
