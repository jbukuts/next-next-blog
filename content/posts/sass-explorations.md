---
desc: 'Use cases for various Sass functionalities'
tags: ['styling', 'sass']
created: 2023-04-14
---

# Sass Explorations

If you've used Sass before there's no doubt you've used some of its most prominent features like nested selectors. However, within Sass, there's also a whole host of other functionalities that can help you to write maintainable styling for all your components.

Here I'll cover a couple of use cases I've found in Sass that made my life just a tad bit easier.

## Simple utility classes

Often when building out your site it's best to try and define your various tokens as variables in [partials](https://sass-lang.com/guide#topic-4) that can be consumed throughout all your style sheets.

When you have tokens though you'll often want to create a myriad of utility classes that are based on them as well. For instance, with spacing tokens, you may want them to be defined to affect the gap in flex containers or the padding of elements.

So rather than defining these classes manually let's instead look at a programmatic way to create them. In this example let's assume you've defined some spacing tokens for your site in a map that may look something like this:

```scss
$spacings: (
  sm: 0.5rem,
  md: 1rem,
  lg: 2rem
);
```

Now to create a series of classes that are based on these tokens we can write a mixin like so:

```scss
@mixin create-utility-class($map, $property) {
  @each $key, $value in $map {
    &-#{$key} {
      #{$property}: $value;
    }
  }
}
```

What's occurring here is that when we use our mixin we'll pass in two properties, the first being the map we want to iterate over and the second being the property to which our utility classes will apply. We iterate over each key and value pair within the map and using a [quoted string](https://sass-lang.com/documentation/interpolation#quoted-strings) we can then define the property we want to be affected in our class alongside its value from the map.

Here's the mixin in action in a use case where we'd want to create a series of classes that affect the `gap` property of a flex container:

```scss
.spacing {
  @include create-utility-class($spacings, 'gap');
}
```

When used like this our mixin would yield a series of classes in CSS:

```css
.spacing-sm {
  gap: 0.5rem;
}

.spacing-md {
  gap: 1rem;
}

.spacing-lg {
  gap: 2rem;
}
```

With this mixin, we've now defined all the utility classes we need for the entire input map. And as we change our map our utility classes will follow along creating a single source of truth.

## Determining overlay color

Often you may have elements with varying background colors that you want to overlay some white or black text. The issue comes when you may not be the best at determining when to use one of these two colors. It's always best to use some deterministic function in this case rather than try to predefine which color works best by eyeballing it. Luckily, Sass provides functionality for us to write our [functions](https://sass-lang.com/documentation/at-rules/function) to create values and it seems many other people have faced this problem so I decided to source the equation I'd use from a [Stack Overflow article](https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color) on the topic:

```txt
if (red * 0.299 + green * 0.587 + blue * 0.114) > 186 use black else use white
```

With our equation defined let's look at how we might define it as a reusable function in Sass:

```scss
@use 'sass:color';

@function calc-compliment($color) {
  $red: color.red($color);
  $green: color.green($color);
  $blue: color.blue($color);

  @if ($red * 0.299 + $green * 0.587 + $blue * 0.114) > 186 {
    @return black;
  } @else {
    @return white;
  }
}
```

What we're doing here is we are defining a function with a single parameter of a color token of any type (plain string, hex, HSL, etc.). Sass has a [built-in module](https://sass-lang.com/documentation/modules/color) for various color operations that we can also make use of to extract the red, green, and blue values from the input color. Once we've extracted the values from our input color all we then need to do then is apply our equation and use an `if-else` statement to return the proper color.

A possible use case of this function in action could look like so:

```scss
$bg: red;

.header {
  background-color: $bg;
  color: calc-compliment($bg);
}
```

And now anytime we edit the `bg` color variable our foreground color for text will automatically update to be the correct compliment.

## Easier responsive queries

This last helper pertains to writing media queries more simply. The usual syntax to create a media query that will apply when the viewport width is less than a given amount would usually look like this:

```css
@media (max-width: 600px) {
    .your-class {
        // styling here
    }
}
```

However, I often get the meaning of the `max-width` and `min-width` keywords backward in my head. So to reduce the number of times I have to go to the MDN docs I wrote a simple mixin that's more human-readable for me.

First, let's assume you've defined the various breakpoints for your site as a map in Sass. Something akin to this:

```scss
$breakpoints: (
  'sm': 600px,
  'md': 1300px,
  'lg': 2000px
);
```

With your breakpoints defined let's now create a mixin that will create our media query selector for us without the need for long-winded syntax:

```scss
@mixin apply-lesser-than($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: inspect(map-get($breakpoints, $breakpoint))) {
      @content;
    }
  } @else {
    @warn "Breakpoint `#{$breakpoint}` does not exist";
  }
}
```

Essentially, all that's being done is we pass a string value to our mixin to declare which breakpoint we want our stylings to apply to. The mixin checks to ensure the breakpoint passed in exists within the map and then creates the media query for us. If it doesn't exist it will break and print out an error of what breakpoint string we passed in.

And that's all there is to it. Now we can just continually use this mixin as a replacement for our standard media queries. Here's a quick example using our map from before:

```scss
@include apply-lesser-than('sm') {
  .your-class {
    // styling here
  }
}
```
