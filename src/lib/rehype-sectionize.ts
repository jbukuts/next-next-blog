import { findAfter } from 'unist-util-find-after';
import { visit } from 'unist-util-visit';
import type { Root, Node, Element, ElementContent } from 'hast';

const LEVELS = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6
} as const;

export default function plugin() {
  return function (tree: Root) {
    for (let depth = 6; depth > 1; depth--) {
      visit(
        tree,
        (node: Node) =>
          node.type === 'element' &&
          'tagName' in node &&
          (node.tagName as string) === `h${depth}`,
        (node, index, parent) => {
          const start = node as Element;
          const startIndex = index!;
          const depth = LEVELS[start.tagName as keyof typeof LEVELS];

          const end = findAfter(parent!, start, (node) => {
            const el = node as Element;
            return (
              Object.keys(LEVELS).includes(el.tagName) &&
              LEVELS[el.tagName as keyof typeof LEVELS] <= depth
            );
          });

          const endIndex = end
            ? parent!.children.indexOf(end as Element)
            : undefined;
          const between = parent!.children.slice(startIndex, endIndex);

          const section: Element = {
            type: 'element',
            tagName: 'section',
            properties: {
              'data-heading-rank': depth,
              'aria-labelledby': start.properties.id
            },
            children: between as ElementContent[]
          };

          parent!.children.splice(startIndex, section.children.length, section);
        }
      );
    }
  };
}
