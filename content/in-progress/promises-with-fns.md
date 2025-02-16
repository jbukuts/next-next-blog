---
desc: 'How to use async functions when mapping over an array'
tags: ['js', 'promises']
created: 2025-02-03
---

# Using promises with functional array methods

JavaScript is a pretty weird language when it comes to one its most differentiating features, Promises.

<!-- Promises were probably one of the hardest features for me to really get down when first learning about them years ago. However, they are probably the most powerful feature in the JavaScript language as once you understand them and their purpose you can get creative with how you use them. -->

I won't go into too much detail on Promises themselves other than say they are JavaScript's _"cheat"_ method to allow for asynchronous operations via the event loop (since JS is singe-threaded by design). If you've used JS a while you probably remember nested callback hell. Promises are an extension/fix of this to simplify the API as instead of nested callbacks you can chain `then`/`catch` statements via promises. But enough of that, if you really wanna dig deep on these topics I reccomend reading these articles:

- The event loop as described on MDN [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
- Using Promises from MDN: [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

This post assumes you understand promises on some basic level and will instead focus on how promises can be leveraged alongside some of the common functional methods that arrays have in JavaScript. Chief among them being `map`, `reduce`, and `filter`.

## `.map()`

The `.map()` function is a pretty easy one to understand. At it's most basic implementation its a linear transformation of an array where each element results in a new transformed element.

A classic example would be taking an array of numbers and squaring them as so:

```ts
const numbers = [1, 2, 3, 4];

const sqaured = numbers.map((n) => n * n);
console.log(sqaured);
// expect [1, 4, 9, 16]
```

But what if our callback function was to return a Promise instead? Say we have an array of IDs and we want to call some API to get detailed info about the items. In that case the callback could look like so:

```ts
const ids: number[] = [12345, 54321, 67890, 09876];

const data: Promise<any>[] = ids.map(async (id: number) => {
  const res = await fetch(`https://api.com/${id}`).then((r) => r.json())
  return res
})
console.log(data)
// expect [Promise, Promise, Promise, Promise]
```

> Technically there is no need for the `async/await` within the callback function above as we could just return the `fetch` call itself (since it already returns a Promise). But, for illustrative purposes we'll leave it as is.

However, there's a major flaw with this. Since our callback function in the `.map` method is asynchronous that means each mapped element in the new array will be a Promise. That's all fine and dandy but if we tried to log the resulting array we'd have a major problem as it would just resolve to an array of Promises which we don't want.

Because of this we need to collect the promises via the `Promise.all` static method and wait for all of them to resolve to get our final array. This function accepts a list of promises and returns a single promise that eventually resolves to a list of values based on each promises from the input list.

```ts
const ids: number[] = [12345, 54321, 67890, 09876];

const data: any[] = await Promise.all(ids.map(async (id: number) => {
  const res = await fetch(`https://api.com/${id}`).then((r) => r.json())
  return res
}))
console.log(data)
// expect [{...}, {...}, {...}, {...}]
```

A cool side-effect of this method is the fact that the promises are being resolved in parallel meaning a possible speed increase as compared to something like a traditional `for await` loop.

You can also get very creative with how to utilize this method. As an example, I've used it before with Web Workers to manage a list of workers where each promise won't reslove until a worker has acted on a set number of elements. You can see that souce code [here](https://github.com/jbukuts/wav-visualizer/blob/0372d6432491065b2cf98322f5da9e0addf66ff0/src/workers/init.ts#L121-L141).

## `.reduce()`

The `.map()` function is a pretty easy one to understand. At it's most basic implementation its a linear transformation of an array where each element results in a new transformed element.

The `.reduce()` function is

A classic example would be getting the sum of an array of numbers like so:

```ts
const nums = [1, 2, 3, 4];
const sum = nums.reduce((acc, curr) => acc + curr, 0);
console.log(sum);
// expect 10
```

For our example with promises though let's use the same example from the `.map` section. However, let's have the final value our `reduce` function returns be an object/dictionary with the ID as the key and the resulting API response as the value.

```ts
const ids: number[] = [12345,54321,67890,09876];

const dict = ids.reduce(async (acc, curr: number) => {
  const accAwait = await acc;
  const res = await fetch(`https://api.com/${curr}`).then((r) => r.json())

  return {
    ...accAwait,
    [curr]: res
  }
}, {} as Promise<string, string>)
```

The first thing to call notice to with this is the typecasting attached to the inital value. Because our callback function is asynchronous that means it instead returns the final value (our acculumator) as a Promise, thus the need to typecast the initial value. Also, because the accumulator is a Promise we need to `await` it on each iteration in order to be able to append to it when we return the final value.

> Unlike with the `map` example these promises are not resolved in parallel as `reduce` makes the assumption that each value is dependent on the previous calculated return value from the callback function. Meaning there really is no functional difference from a `for await` loop.
