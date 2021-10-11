import { Canvas, DEFAULT_CANVAS_OPTIONS } from "./src/canvas.js"
import CanvasElement from "./src/canvas-element.js"
import { Throwable } from "./src/util.js"


export function createCanvas(canvasSelector, canvasOptions) {
    const canvas = Throwable.querySelector(canvasSelector)
    const options = {...DEFAULT_CANVAS_OPTIONS, ...(canvasOptions || {})}
    return new Canvas(canvas, options)
}


export default {
    createCanvas,
    Canvas,
    CanvasElement,
}