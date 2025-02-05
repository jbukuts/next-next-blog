---
desc: 'How to compress and inflate prop data when using NextJS SSG'
tags: ["js", "node"]
created: 2/21/2023
---

# Compressing SSG Props

For the creation of this site, I ran into a bit of a snag when it came to performance. Originally I had just wanted to convert Markdown files into static HTML, however, to add more functionality I decided to instead use MDX so I could include JSX in my Markdown.

This led to a slight problem where for a longer article the amount of data needed as a prop for a page rendered via SSG in NextJS exceeded the recommended threshold.

A quick fix I decided upon was to compress the relevant prop data and then inflate it on the client side. 

## Compression

Luckily compression of a JSON object server-side via NodeJS with `zlib` is relatively easy with a bit of code like this:

```js
import zlib from 'zlib';

const content = { content: 'Some obscenely large amount of data' };

function compressData(data) {
    const compressedContent = zlib
        .gzipSync(JSON.stringify(data))
        .toString('base64');

    return compressedContent;
}

const compressedContent = compressedData(content);
```

What's being done here is `gzipSync` is a synchronous function that will return a `Buffer` that represents our compressed input data. The `toString` called subsequently will then turn that buffer into a base 64 encoded string. 

With this, we're now done with the server-side stuff needed to compress our data. We can just return this string as one of our props in the `getStaticProps` method that NextJS uses to generate page data for static site generation. Now we can focus on how we'll decompress this data on the client side. 

## Inflation

When the compressed data is passed to our client it will be in the form of a base 64 encoded string. We now need to decompress and convert this back into our original JSON-like object so that we can use it. For the actual deflation step, I opted to use an npm package called `pako`. My implementation looks like this:

```js
import { inflate } from 'pako';

function decompressData(compressedData) {
    const binString = atob(compressedData);

    const bytes = new Uint8Array(binaryString.length);
    bytes.forEach((_, i) => {
        bytes[i] = binString.charCodeAt(i);
    });

    const infBytes = inflate(bytes);

    const infString = new TextDecoder().decode(infBytes);
    const infData = JSON.parse(infString);

    return infData;
}
```

Let's take a look at this works step by step. First, we take our base 64 encoded string and convert that into byte data by populating a `Uint8Array`. This byte data can then be passed into the `inflate` function exported from `pako`. This will return another `Uint8Array` representing the original decompressed data. 

All that's left after that is to turn that byte array back into our JSON object by converting it to a string using the built-in `TextDecoder` and then parsing that resulting string as JSON.

## Conclusion

This approach is a bit overkill but it does decrease the prop size of a given item by a considerable amount. As a quick example, the original size of the content data for my [Making Useless Blobs](/post/build-a-blob) post was roughly 320 kb before any compression. After compression, the content prop data only took up a measly 21.5 kb instead. 

This considerably lowers the static data needed to render a given page for my blog. The cost of this approach is that we now need to have our client web browser handle the decompression of the data before we can do anything with it. But thanks to `pako` the aforementioned performance hit on the client seems to be quite minimal.

For more documentation on the various methods used feel free to peruse these links:

- [zlib](https://nodejs.org/api/zlib.html)
- [pako](https://github.com/nodeca/pako)
- [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
- [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)
