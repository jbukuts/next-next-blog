---
desc: Using web workers
tags: ["js", "web workers"]
created: 2/2/2025
---

# Using Web Workers

To put it short and sweet [Web Workers]() are how we multi-thread on the web. They allow us to offload slow, stainuous operation off the main thread so that the UI of our webpages is somewhat unaffected. Let's try and understand why.

However, Let's

## What about promises

You may be thinking that some form of parallelization can already be achieved via [Promises](). While this technically is true there are some caveats to consider.

Take this code block for example:

```js
const fetchOne = fetch('https://b.com').then(r => r.json());
const fetchTwo = fetch('https://b.com').then(r => r.json());

const [oneRes, twoRes] = await Promise.all([fetchOne, fetchTwo]); 
```

In the above code block we are able to make a . And while the `Promise.all` function can be abused in very creative ways we are still limited. 

**The event loop**.

Promises are a representation of values that should eventually resolve to something. 


JavaScript it weird but genius in its own way. 

But this paradigm can really hurt us as well. Since JS was designed with a "Run-to-completion". 

So if the current message in the event is one that takes a long time to process. Then we are in a lot of trouble as the main thread is essentially locked until its done.  

Just because JS in non-blocking does not mean. There are limited resources and JS has a monotropic brain.

Now let's look at some code that abuses Promises:

```ts
// slow prime checker
const isPrime = (n: number) => {
  const abs = Math.abs(n)
  if (abs <= 3) return true;

  for (let i = 2; i < abs - 1; i++) {
    if (abs % i === 0) return false
  }

  return true;
}

const numbers = []
const primeTest = await Promise.all(numbers.map(isPrime))
```

The above function `isPrime` is designed to be slow. It checks all factors of a number to see if it can divide evenly into it. Now if we try and map a large array of we see






However, when we use await in the context above we are essentially forcing a block to the current thread (in this case the main thread). 

In small case scenarios, like the one above, this is fine. The event loops handles this by working like your scheduler does in your operating system; switching between tasks rapidly so it appears all is fine.

But if we abuse the `Promise.all` function. We can easily see cracks start to show.

What great about Web Workers is that they are not really tied to the main thread's resources. In the context of the event loop they are given their own stack, heap, and message queue. 

## Mixing Promises and Web Workers

We've looked at how promises can hurt us when we using them in the main thread. But what about abusing them in a Web Worker? We're

Even if we stall them it shouldn't effect what's happening in the main thread
 
Take a look at this


