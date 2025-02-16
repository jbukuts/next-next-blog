---
desc: How to theme with TailwindCSS V4
tags: ['styling', 'css']
created: 2025-02-14
---

# Theming with TailwindCSS V4

TailwindCSS V4 recently released and its brought about some major changes to coniguration within the Tailwind ecosystem. Major among them being the removal of the need for the a separate configuration file and all configuartion being done within a CSS file.

This article will cover how we can implement multiple themes using the new CSS configuration that Tailwind offers.

To caveat this article, we won't be using the `dark:` utility that Tailwind offers. This posts will mainly deal with how we utilize custom themed color tokens via CSS variables. I personally never much liked the `dark:` utlity as I thought it clouded the classes applied, however, that utility can still be used in conjunction with the method outlined below in complex cases where an element may need a different theme color applied based on the current theme.

## Defining custom colors

First let's take a look at how add custom colors now in v4. In the old v3 config you might do something like this:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      accent: 'var(--accent)',
      primary: 'var(--primary)'
      // ...
    }
  }
};
```

In v4 though custom theme colors can now be added via the `@theme` directive directly in your top-level CSS file like so:

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-primary: var(--primary);
}
```

With this the color utility classes you use widely will be mapped to these variables (`bg-background`, `text-foregroud`, `border-accent`, etc.).

> What's nice about this is we can actually also augment the opacity of these colors using utility classes as well with something like `text-primary/50`. This was always a complaint of mine when trying to build out theming with SCSS as I'd have to build out a custom function to handle this.

That said, we still need to map the underlying CSS variables these theme colors use to actual colors. To do that we'll use the `@layer` Tailwind directive to target the `base` layer.

```css
@layer base {
  :root {
    --background: #ededed;
    --foreground: #0a0a0a;
    --accent: var(--color-gray-600);
    --primary: var(--color-blue-600);
  }

  [data-theme='dark'] {
    --background: #0a0a0a;
    --foreground: #ededed;
    --accent: var(--color-gray-300);
    --primary: var(--color-blue-600);
  }
}
```

> If you want more info on the `@layer` directive feel free to read the Tailwind docs on the topic. The best description I've found of its purpose is [here](https://v2.tailwindcss.com/docs/functions-and-directives#layer) from the v2 docs but the reasoning should still hold the same in v4.

You might notice in the above example there's a mix of defined colors as well as referneces to CSS variables. Another nice thing in v4 is the ability to reference the built-in Tailwind color tables from these CSS variables. This not only applies in this CSS file but also as arbitrary values when using utility classes. For instance, one issue I would run into in v3 was trying to create custom drop shadows that still used Tailwind color tokens. In v4 you can just use the variables inline via `drop-shadow-[0_0_10px_var(--color-primary)]`.

Here we're using the `data-theme` attribute to target theme colors. You can also use classes or whatever custom data attribute you want. Just be sure later on you mutate the proper attribute when you want to swap themes.

## Mutating theme

Depending on the front-end library you're using the specifics of implementation might vary. Additionally, if you're using a framework there might already be some open-source package that exist to simplify this. As an example Next.js has [`next-themes`](https://www.npmjs.com/package/next-themes) (which this site uses). I'd highly recommend you try and use some already existing implementation as getting this right can take a little elbow grease to cover for things like theme flickers. But, if you really wanna forego another dependency I'll outline how it can be done manually here in its simplest form.

The process essentially boils down to these steps:

1. Have some custom data attribute be applied to a DOM element (in our case `data-theme`)
2. Store the theme variable in `localStorage`
3. Add some UI functionality to mutate this theme variable (toggle, select, etc.)
4. When our theme variable changes in `localStorage` ensure the data attribute on the DOM element matches.

In React the simplest possible implementation would look like:

```tsx
import { useLocalStorage } from 'usehooks-ts';
import { useEffect } from 'react';

type Theme = 'light' | 'dark';
const THEME_KEY = 'theme-key';
const FALLBACK_THEME = 'dark';

function App() {
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_KEY, FALLBACK_THEME);

  const toggleTheme = () => {
    setTheme((currTheme) => (currTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div data-theme={theme} className='bg-background min-h-screen w-full'>
      <button onClick={toggleTheme}>toggle theme</button>
      <h1 className='text-primary text-5xl'>This is the title</h1>
      {/** your application */}
    </div>
  );
}
```

> This example is dependent on the `usehooks-ts` hook `useLocalStorage` for storing the theme data within `localStorage` so the user's the selection persists between page visits. If you just want to bring this one particular hook in without the entire dependency the source code is available [here](https://github.com/juliencrn/usehooks-ts/blob/master/packages/usehooks-ts/src/useLocalStorage/useLocalStorage.ts).

As stated before since this is the simplest implementation it has pitfalls. One specifically being since this method has no pre-checks before page load if the initial theme and the one stored in `localStorage` do not match it will cause a flicker from one to the other on the inital load of the page.

But this illustrates the general idea. With this now your custom color attributes (`--color-primary` and `--color-background` shown above) will be dependent on the `data-theme` attribute that is set on the wrapping div element and come from the ones we defined earlier as part of our theme configuration in Tailwind.
