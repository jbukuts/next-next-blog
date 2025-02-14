---
desc: 'How to programmatically insert a JSX element into your MDX at build time'
tags: ['js', 'mdx']
created: 2023-04-24
---

# Inserting JSX Into MDX

MDX is a wonderful extension of Markdown as a whole. If you've never used it before the main selling point is the ability to write and insert JSX syntax within your Markdown content. This is extremely useful as it allows the use of interactive content between your otherwise static Markdown.

## Integrate JSX the standard way

For instance, let's say you were writing up a documentation site for your UI framework. With MDX you could easily insert the actual component itself into the documentation like so:

```md
## My component

Some info on the component

### Demo

<MyComponent/>
```

Very simple indeed. And depending on how you integrate the MDX content you can dynamically define which components are consumed. For more on that, I'd recommend reading the documentation on [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) or [gatsby-plugin-mdx](https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/) if you'd like integration for Next.js or Gatsby respectively.

## Programmatic insertion of an element

However, let's look at a use case where we have some element we want in our MDX that shows up repeatedly. A good example of this is the bar at the top of this page that contains the tag and date information. We could just insert this at the top of every one of our MDX documents but that's a relatively ugly approach if we wanted to someday remove it as we'd have to edit the documents themselves again.

Let's think instead about how to programmatically insert an element into the content itself when it's being sourced and transformed.

For this, I'll assume you have some background on how Markdown is usually transformed into HTML or, in this case, JSX. The standard procedure is to use a parser such as `remark` to tokenize the raw Markdown into an abstract syntax tree (AST) and then compile it into its final form as HTML.

These syntax trees usually follow the [unist spec](https://github.com/syntax-tree/unist) and for Markdown and HTML, they follow the [Markdown Abstract Syntax Tree](https://github.com/syntax-tree/mdast) (MDAST) and [Hypertext Abstract Syntax Tree](https://github.com/syntax-tree/hast) (HAST) specs respectively.

That's a very short explanation of the process. So if you'd like to get a bit more familiar with the topic here's some helpful reading to get you started.

- [remark](https://www.npmjs.com/package/remark)
- [rehype](https://www.npmjs.com/package/rehype)
- [unified](https://www.npmjs.com/package/unified)

In terms of the transformation process when it comes to MDX it's slightly different. Here's an excerpt directly from the [MDX spec page](https://github.com/mdx-js/specification):

```txt
Parse: Text => MDAST
Transpile: MDAST => MDXAST
Transform: MDX/Remark plugins applied to AST
Transpile: MDXAST => MDXHAST
Transform: Hyperscript plugins applied to AST
Transpile: MDXHAST => JSX
```

It's these transformation phases that will allow us to insert an element into the static content. Essentially when the content is represented as an AST we have free reign to insert new nodes as long as they follow the spec.

### The custom plugin

With all that context out of the way on how this will work let's take a look at the custom plugin now:

```js
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import { EXIT, visit } from 'unist-util-visit';

const { children: elementToInsert } = fromMarkdown(
  '<ArticleTags tags={tags} timeToRead={timeToRead} date={date}/>',
  {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()]
  }
);

export default function remarkInsertJSX() {
  return (root) => {
    visit(
      root,
      (node) => {
        const { type, depth } = node;
        return type === 'heading' && depth === 1;
      },
      (_, index) => {
        if (index === null) return EXIT;
        root.children.splice(index + 1, 0, ...elementToInsert);
        return EXIT;
      }
    );

    return root;
  };
}
```

Let's talk now about how this works. First, we'll use a myriad of utilities to turn our JSX string into a node that can be inserted into the AST that represents the JSX content. This is done through the creation of the `elementToInsert` variable.

For the actual plugin to work it's pretty standard for its return value to be a function itself that accepts an AST as a parameter. Within this returned function we'll have access to the entire syntax tree representing our content.

In this case, I'm using a `unist` [utility](https://github.com/syntax-tree/unist-util-visit) called `visit` that's designed to parse the entirety of an AST. In this example, the function is accepting three parameters in the form of the tree to parse, a function that will check a node and return a truthy value, and a function that will run when the previous function returns true.

We use it here since we're trying to find an occurrence of an H1 tag in the tree as the checker function looks at a node and returns true if it's both a heading element with a depth of 1. We also return `EXIT` at the end of the visitor function so that we can exit parsing the tree early.

Since the edits we made to the syntax tree have been in-place inside the `visit` function all we need to return at the end is the original tree object itself.

### Consuming the plugin

To consume this plugin that will be dependent on how you process your content. In my case, I use `next-mdx-remote` to process my content:

```js
import { serialize } from 'next-mdx-remote/serialize';
import remarkBreaks from 'remark-breaks';
import remarkInsertJSXAfterHeader from './plugins/remark/remark-insert-jsx';

function processContent(rawMarkdown) {
  const timeToRead = 2;
  const tags = ['one', 'two'];
  const date = '4-18-2023';

  return serialize(rawMarkdown, {
    mdxOptions: {
      remarkPlugins: [remarkBreaks, remarkInsertJSXAfterHeader],
      rehypePlugins: [],
      format: 'mdx'
    },
    scope: { timeToRead, tags, date },
    parseFrontmatter: false
  });
}
```

Through the `serialize` function exported from `next-mdx-remote` we can simply pass in our raw content alongside any plugins we want to use when processing the content. Notice also the use of the `scope` option. This is what allows us to define the props to be consumed by the component we used above.

As for how this raw content is consumed on a page we can create a simple component that just passes the return value of this function into the wrapper supplied by the package:

```js
import { MDXRemote } from 'next-mdx-remote';

const components = {
  ArticleTags
};

const Content = ({ processedContent }) => {
  return (
    <article>
      <MDXRemote {...processedContent} components={components} />
    </article>
  );
};

export default Content;
```

And that's about it.
