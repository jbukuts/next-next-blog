---
desc: 'Using route handlers to create an XML RSS feed in Next.js 13'
tags: ['js', 'next.js']
created: '5-09-2023'
---

# Create RSS Feed with Next.js

With the recent stable release of the `app` directory and router within Next.js many new features have been brought into the framework's ecosystem.

One of the features that I've found most interesting is the addition of [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/router-handlers) which seems to act as an expansion and mirror of the `page` directories [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes).

Here I'll outline a nice use case for these route handlers that includes many of the new features they've brought. I'll do this in the form of the creation of an RSS feed for a blog-type site such that the XML required for the feed is served statically and can be revalidated and updated at both set intervals and on demand.

I should also note that I'm using the newest stable release of Next.js at the time of writing this in May 2023 (v13.4.1). Older versions may have access to the `app` directory through the experimental config variable but probably don't have access to route handlers so if using an older version it's probably best to upgrade. 

## Creating a handler

First, let's take a look at how we might create an endpoint to house our RSS feed API request. In the `page` router, this would be handled via the creation of a new `.js` file within the `api` folder to look something like `/page/api/rss`. 

### Adding a rewrite

When added like this our API endpoint could then be hit at `{SITE_URL}/api/rss`. But to better follow an RSS feed hosted similarly to a static XML file we could also use a rewrite in our `next.config.js` like so:

```js
const config = {
  // ... more configuration
  async rewrites() {
    return [
      {
        source: '/rss.xml',
        destination: '/api/rss'
      }
    ];
  }
}

module.exports = config;
```

This rewrite will route the `/api/rss` endpoint to instead be at `/rss.xml`. Which is more consistent with how a feed is usually hosted for a site.

### Creating a route handler

However, with the inclusion of route handlers in the new `app` router we can be a lot more flexible in how data is served from these endpoints.

Before, in the `page` router, the resulting response for these endpoints always needed to be evaluated during the server's runtime. 

But now in the `app` router, we can have the response to these endpoints evaluated at build time and served statically during the runtime of our server. This is a perfect scenario for us to be able to generate an RSS feed for a blog programmatically.

This creates a delineation between route handles as they can be either static or dynamic depending on the context they're used of how we can configure them. Of course, it's best to consult the documentation directory based on your use case so here are links to understand when each is implemented:

- [Route Handlers Behavior](https://nextjs.org/docs/app/building-your-application/routing/router-handlers#behavior)
- [Examples](https://nextjs.org/docs/app/building-your-application/routing/router-handlers#examples)

Now let's create a simple route handler in our `app` directory. To do this simply create a file at `/app/api/rss/route.js`. This will create an endpoint at `/api/rss` on our site same as the last. We'll also keep the rewrite I showed before. 

This setup is not a requirement as theoretically a route handler can be created anywhere as long as it doesn't overlap with the route of a page. But I like to keep endpoints like this together for semantic purposes. 

Let's take a look at how the handler might look at `/app/api/rss/route.js` in our project now:

```js
import { NextResponse } from 'next/server';

export async function GET() {
  const res = JSON.string({ message: 'hello world!'});

  return new NextResponse(res, {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

Let me note a couple of differences from the old API routes now. 

Firstly, the name of the exported function now matters as it defines the type of requests the handler can accept. In this example, we export the `GET` function meaning this route handler can only accept `GET` requests.

Second, you'll note we no longer are using the response variable that was available before as a parameter in our handler function. We instead now use an instance of the `NextResponse` object to send a response. This is a somewhat large change but luckily the object is simply an extension of the Web API `Response` object as outlined in the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Response). 

### Creating the feed

Now that we've created a bare-bones handler let's add the business logic required to create and return an XML feed. 

```js
import { Feed } from 'feed';
import { NextResponse } from 'next/server';
import profile from 'profile';

const {
  siteURI,
  firstName,
  lastName,
  image,
  copyRightYear,
  siteTitle,
  description,
  emailAddress,
  linkedInProfile
} = profile;
const SITE_URL = `https://${siteURI}`;
const FULL_NAME = `${firstName} ${lastName}`;

export async function GET() {
  const feed = new Feed({
    title: siteTitle,
    description,
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    image: `${SITE_URL}${image}`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `${copyRightYear} ${FULL_NAME}`,
    feedLinks: {
      json: `${SITE_URL}/json`,
      atom: `${SITE_URL}/atom`
    },
    author: {
      name: FULL_NAME,
      email: emailAddress,
      link: linkedInProfile
    }
  });

  // dynamic import needed or it complains
  const getDataStoreSorted = await import('@/data-layer/data-layer').then(
    (m) => m.getDataStoreSorted
  );

  const postList = await getDataStoreSorted();

  postList.forEach((postItem) => {
    const { title, slug, desc, date, tags } = postItem;

    feed.addItem({
      title,
      id: `${SITE_URL}/post/${slug}`,
      link: `${SITE_URL}/post/${slug}`,
      description: desc,
      date: new Date(date),
      image: `${SITE_URL}${image}`,
      category: tags.map((tag) => ({ name: tag }))
    });
  });

  const xml = feed.rss2();

  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

In this case, we're using an [npm package](https://www.npmjs.com/package/feed) designed to help us easily create an RSS feed called `feed`. You'll also notice my use of a `profile` object and a dynamic import for a `data-layer` package.

These are helpers I've written myself where `profile` is simply an object that holds some global constants for my site and `data-layer` acts as a collection of functions to source my content. Depending on how you source content it could be different but the overarching approach will be the same.

Another thing to note is the use of a dynamic import. This is most likely just caused by growing pains within the `app` directory as a normal import would cause the route to break for no apparent reason. So if you face a similar error importing a package in your handler attempt a dynamic import like so. 

With that though, if you were to simply build your site locally now you'd notice this route is marked as a completely static route. Which is exactly what we want. Now let's take a look at how we might update its data during the runtime of our server. 

## Revalidation

In this section, we'll look at both how to update our static route at set intervals as well as on-demand. 

To revalidate a route at set intervals is extremely easy via the use of [Segment Config Options](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config). All we need to do is add a simple line like this to our route handler:

```js
// ...imports
export const revalidate = 86400
// ...route logic
```

This ensures that any of the `fetch` calls we use within the route's cache data will be revalidated at this interval in seconds. I should also note that this value can be set itself when a `fetch` call is made via the `next.revalidate` option available.

For on-demand revalidation, the process is a bit more involved. 

To revalidate cache data on-demand we'd have to create another dynamic route handler. The code for such a handler might look like this:

```js
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const { REVALIDATE_SECRET } = process.env;

export async function POST(request) {
  const { token } = await request.json();

  if (token !== REVALIDATE_SECRET)
    return new NextResponse(JSON.stringify({
        401,
        message: 'No token',
        revalidated: false,
        now: Date.now()
    }), {
        headers: { 'Content-Type': 'application/json' }
    });

  revalidateTag('feed-data');
  revalidatePath('/rss.xml');

  const response = {
    status: 200,
    revalidated: true,
    now: Date.now()
  };

  return new NextResponse(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
```

This is a simple example extrapolated from the [documentation itself](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating#using-on-demand-revalidation). It's also evaluated to be a server function that is dynamic due to the export of the `POST` function as any function exported besides `GET` will, by default, be a dynamic route. 

However, the important parts that cause our cached data to revalidate are the use of the `revalidateTag` and `revalidatePath` functions though.

The `revalidatePath` function allows us to revalidate the cache for all fetched data on a certain path. The `revalidateTag` function also allows us to revalidate data but is more granular as it only applies to the `fetch` calls that are marked with the matching tag in the `next.tags` array in the [fetch options](https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options).

The use of which function depends on your use case, but most likely you'll want to use a tag as the data sourced to create the RSS feed is probably the same you'll use to build your static index page as well. 

To end here's a list of useful links to documentation on how data fetching works in the `app` directory as well as some on revalidation:

- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)
- [Caching Data](https://nextjs.org/docs/app/building-your-application/data-fetching/caching)
- [Revalidating Data](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)

