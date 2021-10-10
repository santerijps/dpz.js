export class MouseButton {
    static LEFT = 0
    static RIGHT = 2
}


export class Throwable {

    static querySelector(selector) {
        const element = document.querySelector(selector)
        if (element === null)
            throw Error("Could not find canvas element with selector:", selector)
        return element
    }

}


export function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min)
}


export function forEachElementChild(element, callback) {
    const results = []
    for (const child of element.children) {
        const result = callback(child)
        if (typeof result !== "undefined") {
            results.push(result)
        }
    }
    return results
}


export default {
    MouseButton,
    Throwable,
    clamp,
    forEachElementChild,
}