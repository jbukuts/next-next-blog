import remarkFrontmatter from 'remark-frontmatter';
import remarkLintFrontmatterSchema from 'remark-lint-frontmatter-schema';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkPresetStyleGuide from 'remark-preset-lint-markdown-style-guide';

const config = {
  settings: {},
  plugins: [
    remarkFrontmatter,
    remarkPresetLintConsistent,
    remarkPresetLintRecommended,
    remarkPresetStyleGuide,
    'preset-prettier',
    [
      remarkLintFrontmatterSchema,
      [
        'error',
        {
          embed: zodToJsonSchema(
            z.object({
              desc: z.string().optional(),
              tags: z.string().array().optional(),
              created: z.string().date()
            }),
            { target: 'jsonSchema7' }
          )
        }
      ]
    ],
    ['remark-lint-first-heading-level', ['error']]
  ]
};

export default config;
