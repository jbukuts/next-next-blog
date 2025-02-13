---
desc: 'Steps and math needed to generate a random SVG blob shape'
tags: ["js", "math"]
created: 2/17/2023
---

# Making Useless Blobs

Recently for a personal project I found a need to have some random blobs on a webpage. My first thought was just to whip some up in Adobe Illustrator but I thought it would nice to be able to write some code that could just create some organic shapes for me. I was able to find an [npm package](https://www.npmjs.com/package/blobs) called `blobs` but I thought it'd be interesting to try and solve the problem myself. Essentially the goal was to write an algorithm that would accept some parameters and spit out an SVG compliant shape. To give you and idea of what we're trying to create here's an example:

<FlexContainer>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" overflow="visible"><path d="M 200 93.45 C 201.5 105.33, 182.49 101.05, 174.98 114.98 C 163.01 137.19, 175.18 145.17, 161.03 165.72 C 145.91 187.68, 141.55 191.14, 116.44 200 C 92.96 208.28, 83.84 212.14, 63.85 200 C 37.93 184.25, 45.66 170.92, 24.62 144.21 C 13.74 130.4, 2.64 134.53, 0 118.95 C -4.41 92.93, 1.5 88.52, 10.51 61.01 C 15.58 45.54, 15.27 42.55, 28.16 32.98 C 56.35 12.05, 58.54 8.74, 92.66 0 C 122.89 -7.75, 136.87 -14.66, 156.86 0 C 174.23 12.74, 156.06 30.29, 167.37 54.79 C 177.63 77.01, 197.7 75.24, 200 93.45" fill="blue" stroke="black" strokeWidth="3"></path></svg>
</FlexContainer>

## Creating a polygon

In order to eventually create a blob my first thought was to start by making some random polygon with an arbitrary number of vertices as one our parameters. My reasoning was that if I could create some set of vertices that represented a polygon then later I would be able to connect the points together with some smoothing between them to create our final organic shape.

### Determining angles

The simplest approach that I found in order to create some arbitrary polygon was to first start by generating a set of angles at which each of the vertices would fall relative to the center of our shape.

For instance, say we want our polygon to have 5 vertices we can take 2 PI and divide that by 5. Now we can start from zero and increment that value as we go along to create a set of angles. With this set of angles we now know where we want the vertices or our polygon to fall relative to the center.

```js
const UNIT_CIRCLE = 2 * Math.PI;

function createAnglesList(vertices) {
    const standardAngle = UNIT_CIRCLE / steps;

    let cumulativeSum = 0;
    const angles = [...new Array(steps)].map((_,i) => {
        return i * standardAngle;
    });

    return angles;
}
```

The issue with the above approach though is that it creates a set of equidistant angles every time. What we need to do is introduce a modifier that ensures the angles returned are different even if the same values for `vertices` is passed in. To do this we can extend the function slightly to allow a fractional value that adds some irregularity to the angles returned. 

```js
const UNIT_CIRCLE = 2 * Math.PI;

function createRandomAnglesList(steps, irregularity) {
    const standardAngle = UNIT_CIRCLE / steps;

    let cumulativeSum = 0;
    const angles = [...new Array(steps)].map(() => {
        // accepts `a` and `b` and returns value between `a-b` and `a+b`
        const angle = giveOrTake(standardAngle, irregularity);
        cumulativeSum += angle;
        return angle;
    });

    // normalize to force angles to sum to 2PI
    cumulativeSum /= UNIT_CIRCLE;
    return angles.map((angle) => angle / cumulativeSum);
};
```

Passing a 0 to the above function for the `irregularity` value will still allow it to return equidistant angles but otherwise it will return a set of random angles for the same inputs. 

### Distance from center

Now that we have a set of angles our next step is to translate these angles into a set of vertices that can represent our polygon. 

Let's think of each angle we have in our set as casting a ray from the center. In order to create a random shape we need only choose a point on this ray that fits within our bounding box. Our bounding box in this case is the width and height of the resulting SVG we are going to create. 

In order to do this we'll first calculate the point `[x,y]` that falls on our bounding box for a given angle since this is the maximum point from the center our vertex can fall on. One thing to note is that we can calculate this point to always be in the first quadrant since our bounding shape is uniform in all quadrants and all we care about is it's distance from the center.

Once we have this point we can then calculate the distance `maxRadius` from the center of our shape to it using the distance formula and multiply that by a random number `[0,1]` creating a new distance from the center. With this length we can then convert that into a point `[x,y]` using a bit of trigonometry. Putting this together with our previously defined `createRandomAnglesList` our algorithm would look something like: 

```js
function createShape(vertices, width, height, irregularity) {

    const angleSet = createRandomAnglesList(vertices, irregularity);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return anglesSet.map((currentAngle) => {
        const sin = Math.sin(currentAngle);
        const cos = Math.cos(currentAngle);

        // for given angle calculate point on bounding box
        const [x, y] = calculateIntersectionPoint(
            currentAngle, 
            halfHeight, 
            halfWidth
        );

        // distance formula
        const maxRadius = Math.sqrt(x ** 2 + y ** 2);
        const radius = Math.random() * maxRadius;

        // convert to x, y position
        const point = [(wRadius + radius * cos), (hRadius + radius * sin)];
        return point;
  });
}
```

In the above example we also have to think in terms of two different coordinate systems. This is because in standard Cartesian space our starting point `[0,0]` would normally exist at the center of our image. 

However, since we're going to have to plot in SVG space our `[0,0]` point isn't at the center but rather the upper left-hand side. This doesn't matter when calculating angles or even the intersection point of the bounding box given these can be done in Cartesian space first and then translated. The translation occurs here:

```js
const point = [(wRadius + radius * cos), (hRadius + radius * sin)];
```

As this line allows us to shift our `x` and `y` values from the top left to the center and then apply our new radius from the center using trigonometry. 

It can also be noted the function `calculateIntersectionPoint` exist to calculate the point `[x,y]` where our ray from the center intersects our bounding box in the first quadrant. If we assume our bounding box is a rectangle the implementation for `calculateIntersectionPoint` could be as follows:

```js
function calculateIntersectionPoint(angle, heightRadius, widthRadius) {
    // ignore slope since bounding shape is uniform
    const tan = Math.abs(Math.tan(angle));

    let x = widthRadius;
    let y = tan * x;

    // whether to bound to x or y axis
    if (y > heightRadius) {
        y = heightRadius;
        x = y / tan;
    }

    return [x, y];
};
```

However, we can also apply our bounding box as an ellipsis instead with an implementation like so:

```js
function calculateIntersectionPoint(angle, heightRadius, widthRadius, type) {
    const tan = Math.abs(Math.tan(angle));
    const ab = widthRadius * heightRadius;
    const bottom = Math.sqrt(heightRadius ** 2 + widthRadius ** 2 * tan ** 2);
    const x = ab / bottom;
    const y = (ab * tan) / bottom;
    return [x, y];
};
```

In both implementations of `calculateIntersectionPoint` we don't really care about the sign of our `tan` value and as such can take the absolute value to force our point to be in the first quadrant. This is because, as stated before, we use this point to calculate the max distance from the center so direction doesn't matter. 

With all this put together we now have an algorithm for creating a random polygon. Our inputs allow an arbitrary number of vertices as well as a value for irregularity to create some entropy. With that here's an example of what the output might look like for both types of bounding boxes with a width/height of `200px` and an input of 12 for the `vertices`:

<FlexContainer>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" overflow="visible" style={{border: '3px solid orange'}}><circle cx="11.77" cy="102.11" r="3" stroke="red" fill="red"></circle><circle cx="4.71" cy="148.2" r="3" stroke="red" fill="red"></circle><circle cx="17.44" cy="46.33" r="3" stroke="red" fill="red"></circle><circle cx="40.94" cy="0" r="3" stroke="red" fill="red"></circle><circle cx="108.7" cy="0" r="3" stroke="red" fill="red"></circle><circle cx="174.69" cy="12.17" r="3" stroke="red" fill="red"></circle><circle cx="192.29" cy="78.86" r="3" stroke="red" fill="red"></circle><circle cx="188.64" cy="123.53" r="3" stroke="red" fill="red"></circle><circle cx="200" cy="170.64" r="3" stroke="red" fill="red"></circle><circle cx="145.39" cy="173.03" r="3" stroke="red" fill="red"></circle><circle cx="90.88" cy="200" r="3" stroke="red" fill="red"></circle><circle cx="42.33" cy="200" r="3" stroke="red" fill="red"></circle></svg>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" overflow="visible" style={{border: '3px solid orange', borderRadius: '50%'}}><circle cx="0.44" cy="90.62" r="3" stroke="red" fill="red"></circle><circle cx="18.65" cy="134.94" r="3" stroke="red" fill="red"></circle><circle cx="14.81" cy="47.63" r="3" stroke="red" fill="red"></circle><circle cx="52.33" cy="32.27" r="3" stroke="red" fill="red"></circle><circle cx="83.76" cy="10.71" r="3" stroke="red" fill="red"></circle><circle cx="145.71" cy="26.58" r="3" stroke="red" fill="red"></circle><circle cx="167.66" cy="78" r="3" stroke="red" fill="red"></circle><circle cx="199.9" cy="104.39" r="3" stroke="red" fill="red"></circle><circle cx="185.71" cy="143.2" r="3" stroke="red" fill="red"></circle><circle cx="160.38" cy="179.72" r="3" stroke="red" fill="red"></circle><circle cx="123.33" cy="197.24" r="3" stroke="red" fill="red"></circle><circle cx="60.13" cy="191.71" r="3" stroke="red" fill="red"></circle></svg>
</FlexContainer>

## Smoothing lines

With that we've now created a list of vertices that can represent our shape. But if we were to just connect each of the points with a straight line we would end up with a very jagged blob. In order to eliminate these harsh lines we have to introduce another step. 

What we'll do is introduce something called Bezier interpolation.

For the purpose of brevity I won't go too in depth on Bezier interpolation as there are a multitude of other articles explaining the concept better than I can. To get a better understanding I'd recommend these articles:

- [Create smooth shapes using Bezier curves](https://towardsdatascience.com/b%C3%A9zier-interpolation-8033e9a262c2)
- [Bezier Interpolation](https://medium.com/@adrian_cooney/bezier-interpolation-13b68563313a)
- [Interpolation with Bezier Curves](https://agg.sourceforge.net/antigrain.com/research/bezier_interpolation/index.html)


But to summarize the process, what we'll do is create a function that takes in 4 points `a, b, c, d`. From these 4 points we will return 2 points `controlB, controlC` that will represent the 2 control points for `b` and `c`. All together `b`, `c`, `controlB`, and `controlC` will represent the 4 parts that make up a single cubic bezier curve. 

For the points `a, b, c, d` the points `b` and `c` represent the 2 points that form the current line we want to draw for our blob and `a` and `d` represent the adjacent points before and after our current line respectively. 

Let's say we have a list of vertices `[p1,p2,p3,p4]` and a function that returns the 2 control points mentioned before called `calculateControl`. If we iterate over our list of vertices then the calls to `calculateControl` would look like:

- Current line `p1` to `p2`: `calculateControl(p4, p1, p2, p3)`
- Current line `p2` to `p3`: `calculateControl(p1, p2, p3, p4)`
- Current line `p3` to `p4`: `calculateControl(p2 ,p3, p4, p0)`
- Current line `p4` to `p1`: `calculateControl(p3, p4, p0, p1)`

The `calculateControl` function is rather lengthy so I won't post it all here. The implementation I used is essentially a translation of the one found [here](https://agg.sourceforge.net/antigrain.com/research/bezier_interpolation/index.html) into Javascript though.

In order to create all the Bezier curves for the points in our polygon the code needed would look like this:

```js
function allControlPoints(polygonPoints) {
    const loopedPoints = [
        polygonPoints[polygonPoints.length - 1],
        ...polygonPoints,
        polygonPoints[0],
        polygonPoints[1]
    ];

    return loopedPoints.slice(1, -2).map((point, index) => {
        const before = loopedPoints[index];
        const a = point;
        const b = loopedPoints[index + 2];
        const after = loopedPoints[index + 3];
        const controlPoints = calculateControl(before, a, b, after);
        return controlPoints;
    });
}
```

Here the input of `polygonPoints` represents the returned list of points from our `createShape` function. The return value for this function is a 2-D list of control points with the same length of our input list and each value being a list of our 2 control points. 

From here we can finally generate a path string that can be understood as the `d` value for a `path` tag as outlined in the [SVG docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d). All together the code to generate our nice organic blob is:

```js
function generatePathString(vertices, irregularity) {
    // create our polygon vertices
    const points = createShape(vertices, irregularity);

    // initial cursor move
    const starting = `M ${points[0][0]} ${points[0][1]}`;

    // 2D list of all cubic bezier control points
    const controlPoints = allControlPoints(points);
    
    // reduce all this into a single d string
    return [...points, points[0]].slice(1).reduce((acc, curr, index) => {
        const [x, y] = curr;
        const [[a1, a2], [b1, b2]] = controls[index];
        return `${acc} C ${a1} ${a2}, ${b1} ${b2}, ${x} ${y}`;
    }, starting);
};
```

Here the initial `starting` variable represents the move `M` call that must be made to move our cursor to the starting point before we can begin to draw in our SVG. Now let's take a look at the output of our algorithm for various different parameter inputs: 

<FlexContainer>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" overflow="visible"><path d="M 107.38 0 C 117.79 7.18, 109.36 28.01, 119.13 28.01 C 134.4 28.01, 136.16 7.47, 157.45 0 C 176.06 -6.53, 187.52 -9.61, 198.94 0 C 208.8 8.29, 199.68 17.89, 200 35.79 C 200.21 47.79, 200 47.8, 200 59.8 C 200 72.91, 206.71 77.39, 200 86.02 C 191.67 96.73, 169.93 91.52, 169.93 98.47 C 169.93 105.75, 190.71 103.02, 200 114.48 C 205.75 121.56, 200 125.02, 200 135.55 C 200 147.69, 200 147.69, 200 159.82 C 200 169.06, 204.27 170.92, 200 178.31 C 192.68 190.97, 189.92 192.94, 176.81 199.91 C 169.52 203.79, 167.53 202.36, 159.19 200 C 139.74 194.49, 140.74 189.98, 121.24 184.18 C 110.52 180.99, 108.6 178.51, 98.74 182.01 C 86.31 186.42, 88.05 199.55, 76.66 200 C 65.21 200.45, 66.14 186.45, 53.06 183.81 C 37.7 180.7, 35.03 191.49, 19.79 188.5 C 8.5 186.28, 1.54 183.88, 0 173.39 C -2.84 154.09, 8.18 151.32, 11.02 128.92 C 12.4 118.02, 11.47 117.31, 8.43 106.79 C 5.96 98.25, 0.44 98.97, 0 90.8 C -0.43 82.83, 5.96 83.08, 6.7 74.5 C 8.2 57.11, 1.88 56.15, 4.47 38.86 C 7.2 20.64, 5.3 8.67, 17.33 3.49 C 29.69 -1.83, 36.37 8.73, 53.24 17.87 C 66.92 25.28, 72.59 40.7, 78.42 36.58 C 85.22 31.77, 70.4 10.22, 78.49 0 C 84.88 -8.07, 97.47 -6.83, 107.38 0" fill="blue" stroke="black" strokeWidth="3"></path></svg>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" overflow="visible"><path d="M 93.91 150.17 C 84.93 141.66, 76.47 154.47, 67.3 146.13 C 48.3 128.84, 49.81 123.86, 37.58 98.92 C 21.06 65.24, 2.15 53.28, 9.8 28.89 C 15.57 10.51, 38.5 8.94, 64.42 13.39 C 98.66 19.28, 97.46 31.15, 130.13 49.57 C 165.25 69.37, 181.58 60.15, 200 89.82 C 216.52 116.43, 216.73 147.89, 200 162.13 C 184.57 175.26, 156.2 134.31, 135.69 144.55 C 118.26 153.25, 134.43 198.61, 124.13 200 C 113.54 201.42, 113.35 168.6, 93.91 150.17" fill="blue" stroke="black" strokeWidth="3"></path></svg>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" overflow="visible"><path d="M 22.19 5.75 C 31.29 1.98, 31.41 1.25, 41.12 0 C 53.75 -1.63, 60.93 -9.71, 66.86 0 C 90.18 38.14, 88.32 95.7, 99.62 95.7 C 110.39 95.7, 97.5 39.07, 110.99 0 C 114.02 -8.78, 127.9 -6.58, 132.66 0 C 140.07 10.23, 139.13 17.7, 135.33 33.62 C 129.05 59.91, 101.8 87.74, 112.51 84.43 C 134.14 77.75, 165.19 30.31, 200 13.64 C 208.94 9.36, 200 28.09, 200 42.54 C 200 58.39, 211.45 67.15, 200 74.24 C 165.89 95.36, 134.32 86.74, 108.88 98.96 C 101.69 102.41, 122.01 101.6, 134.74 105.58 C 167.57 115.85, 199.88 124.23, 200 127.47 C 200.11 130.55, 135.2 107.09, 135.2 118.23 C 135.2 133.51, 204.48 179.91, 200 180.31 C 194.84 180.77, 141.01 129.72, 115.92 119.95 C 106.88 116.43, 127.1 135.92, 131.75 153.72 C 137.55 175.94, 141.64 208.12, 136.81 200 C 125.81 181.48, 114.71 129.35, 100.1 100.44 C 96.38 93.08, 102.34 114.19, 100.16 127.45 C 94.15 163.97, 100.12 173.96, 83.72 200 C 77.27 210.24, 53.25 210.37, 54.47 200 C 58.65 164.51, 106.77 111.32, 94.53 108.27 C 79.53 104.53, 2.46 186.07, 0 186.43 C -2.3 186.77, 82.86 125.53, 85 109.66 C 86.51 98.45, 20.75 131.29, 7.29 132.27 C 0.34 132.78, 45.93 119.08, 44.17 112.64 C 42.29 105.75, 16.5 113.89, 0 105.6 C -5.59 102.79, 0 98.03, 0 90.45 C 0 82.77, 0 82.77, 0 75.09 C 0 69.02, 0 69.01, 0 62.94 C 0 47.69, 0 47.7, 0 32.45 C 0 24.75, -4.24 22.14, 0 17.04 C 6.85 8.79, 10.73 10.5, 22.19 5.75" fill="blue" stroke="black" strokeWidth="3"></path></svg>
</FlexContainer>

## Conclusion

If you want to play around a bit more I made an [npm package](https://www.npmjs.com/package/useless-blobs) containing all this code as well as a [demo](https://jbukuts.github.io/useless-blobs/) you can play around with to see how the parameters affect the final result.
