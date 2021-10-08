# dpz.js
The purpose of this JavaScript library is to make it possible to select an HTML element to behave as a "canvas" on which you can place other HTML elements that can be moved around, zoomed on and panned. The canvas stays completely contained, meaning that nothing spills out of it (e.g. elements can't be dragged outside of the canvas).

Libraries like this do exist but seem to be lacking in extensibility and configurability.

Thus, this library aims to be:
- Easy to setup
- Extremely extendable and configurable
- Lightweight
- Unopinionated

## Basic usage
The library has been written as an ES module, so import it with the module syntax:
```html
<div id="canvas">
    <h1>Drag me!</h1>
</div>

<script type="module">
    import dpz from "./dpz.js"
    const canvas = dpz.createCanvas("#canvas", {
        // options...
    })
</script>
```
In the example above, you can pan and zoom on the canvas, as well as drag the `h1` element around.

## Default options
```js
{
    // Scaling/zoom options
    initialScale: 1,
    scaleMax: 1.5,
    scaleMin: 0.5,
    scaleStep: 0.1,

    // Should drag commence?
    validateDrag: (element, event) => {
        return event.ctrlKey && event.button === MouseButton.LEFT
    },

    // Should pan commence?
    validatePan: event => {
        return event.ctrlKey && event.button === MouseButton.RIGHT
    },

    // Should zoom commence?
    validateZoom: event => {
        return event.ctrlKey
    },
}
```

## Events
Events can be configured with the `canvas.on` function by passing in the name of the event as well as a callback function to handle said event. The arguments passed to the callback function vary depending on the event, except for the DOM `Event` object, which is always the first argument of the callback function.

Drag events additionally pass a `canvasElement` object to the callback function. This object contains a reference to the DOM element, as well as other useful properties and functions.

```js
// Canvas Element
{
    target, // Holds a reference to the HTML element
    offset, // {x, y} The offsetLeft and offsetTop with the position x and y added
    center, // {x, y} The x and y coordinates of the center of the element relative to the canvas element
    position, // {x, y} The position x and y relative to the element's initial position (initially {0, 0})
    translate, // {x, y} The translate (CSS transform function) x and y of the element (initially {0, 0})
    moveBy(x, y), // Move the element by x and y pixels
    setPosition(x, y), // Update the x and y properties of the position object.
    setTranslate(x, y), // Update the x and y of the translate object.
}
```

### dragstart
```js
canvas.on("dragstart", (mousedownEvent, canvasElement) => {
    // do something
})
```
### dragmove
```js
canvas.on("dragmove", (mousemoveEvent, canvasElement) => {
    // do something
})
```
### dragend
```js
canvas.on("dragend", (mouseupEvent, canvasElement) => {
    // do something
})
```
### panstart
```js
canvas.on("panstart", (mousedownEvent) => {
    // do something
})
```
### panmove
```js
canvas.on("panmove", (mousemoveEvent) => {
    // do something
})
```
### panend
```js
canvas.on("panend", (mouseupEvent) => {
    // do something
})
```
### zoom
```js
canvas.on("panstart", (wheelEvent) => {
    // do something
})
```

## How does it work?
The elements within a canvas are moved around by using the CSS transform functions `translate(x, y)` and `scale(x, y)`. The `position` object keeps track of the canvas elements nominal position, whereas the `translate` object maintains the current translate x and y parameters. This is done to ensure that zooming in and out moves the canvas elements correctly to compensate for the changing scale. The default behaviour of CSS transform `scale` is to keep the elements' center points in the same exact place, which is an undesirable result when zooming in and out, since the default behaviour does not create a 3-dimensional illusion of distance.