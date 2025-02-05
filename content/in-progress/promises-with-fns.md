---
desc: 'How to use async functions when mapping over an array'
tags: ['js', 'promises']
created: '2-3-2025'
---

# Using


## `.map()`

The `.map()` function is a pretty easy one to understand. At it's most basic its a linear trans

A classic example would be taking an array of numbers and squaring them as so:

```ts
const numbers = [1,2,3,4]

const sqaured = numbers.map((n) => n * n);
console.log(sqaured)
// expect [1,4,9,16]
```

The length of the computed array is the same as the original array and each value is computed fr.

But what if we want our function to return. 

Say we have an array of ids and we want to call some API to get some info about the items

In that case the callback can

```ts
const ids = [12345,54321,67890,09876];

const data = await Promise.all(ids.map((id) => {
  const res = await fetch(`https://api.com/${id}`).then((r) => r.json())
  return res
}))
```

> Technically in this example there is no need for the `async/await` within the callback function as we could just return the `fetch` call itself (since it already returns a Promise).

Since the callback now returns a 

This also can be a traditional loop as well because since the mapped array is a list of promises each of them can be resolved in parallel.

A positive to this is 






`.reduce()`


Let's using the same example of the `.map` section but instead let's have the final value be an object with the ids as the keys and the result API response as the values. 

```ts
const ids = [12345,54321,67890,09876];

const dict = ids.reduce(async (acc, curr) => {
  const accAwait = await acc;
  const res = await fetch(`https://api.com/${curr}`).then((r) => r.json())

  return {
    ...accAwait,
    [curr]: res
  }
}, {} as Promise<string, string>)
```

Notice the typecasting attached to the inital value.

Because the callback function is now asynchronous is will return a function. Because of this on each execution in order to get the real value we have to wait for

This
