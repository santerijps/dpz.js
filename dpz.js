export const DEFAULT_OPTIONS = {

    // Scaling options
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


export function createCanvas(canvasSelector, canvasOptions) {

    const canvas = Throwable.querySelector(canvasSelector)
    const options = {...DEFAULT_OPTIONS, ...(canvasOptions || {})}

    canvas.style.overflow = "hidden"

    const eventHandlers = {}, dispatchEvent = (eventName, ...args) => {
        if (eventHandlers[eventName]) {
            eventHandlers[eventName](...args)
        }
    }

    let scale = options.initialScale
    let panning = false
    let recentlyStoppedPanning = false

    let elements = forEachElementChild(canvas, element => {

        let dragging = false
        const position = {x: 0, y: 0}, translate = {x: 0, y: 0}

        const moveBy = (x, y) => {
            position.x += x
            position.y += y
            translate.x += x
            translate.y += y
            setElementTransform(element, translate.x, translate.y, scale)
        }

        const setPosition = (x, y) => {
            position.x = x
            position.y = y
        }

        const setTranslate = (x, y) => {
            translate.x = x
            translate.y = y
        }

        const canvasElement = {
            target: element,
            get offset() {return {x: element.offsetLeft + position.x, y: element.offsetTop + position.y}},
            get center() {return {x: this.offset.x + element.offsetWidth / 2, y: this.offset.y + element.offsetHeight / 2}},
            get position() {return position},
            get translate() {return translate},
            moveBy,
            setPosition,
            setTranslate,
        }

        element.addEventListener("mousedown", event => {
            if (options.validateDrag(element, event)) {
                event.preventDefault()
                dispatchEvent("dragstart", event, canvasElement)
                dragging = true
            }
        })

        document.addEventListener("mousemove", event => {
            if (dragging) {
                event.preventDefault()
                dispatchEvent("dragmove", event, canvasElement)
                position.x += event.movementX
                position.y += event.movementY
                translate.x += event.movementX
                translate.y += event.movementY
                setElementTransform(element, translate.x, translate.y, scale)
            }
        })

        document.addEventListener("mouseup", event => {
            if (dragging) {
                event.preventDefault()
                dispatchEvent("dragend", event, canvasElement)
                dragging = false
            }
        })

        return canvasElement
    })

    canvas.addEventListener("contextmenu", event => {
        if (recentlyStoppedPanning) {
            event.preventDefault()
            recentlyStoppedPanning = false
        }
    })

    document.addEventListener("contextmenu", event => {
        if (recentlyStoppedPanning) {
            event.preventDefault()
            recentlyStoppedPanning = false
        }
    })

    canvas.addEventListener("mousedown", event => {
        if (options.validatePan(event)) {
            event.preventDefault()
            dispatchEvent("panstart", event)
            panning = true
        }
    })

    document.addEventListener("mousemove", event => {
        if (panning) {
            event.preventDefault()
            dispatchEvent("panmove", event)
            elements.forEach(element => {
                element.moveBy(event.movementX, event.movementY)
            })
        }
    })

    document.addEventListener("mouseup", event => {
        if (panning) {
            event.preventDefault()
            dispatchEvent("panend", event)
            panning = false
            recentlyStoppedPanning = true
        }
    })

    canvas.addEventListener("wheel", event => {
        if (options.validateZoom(event)) {
            event.preventDefault()
            dispatchEvent("zoom", event)

            const direction = -event.deltaY * 0.01

            if (direction === -1 && scale <= options.scaleMin) return
            if (direction === 1 && scale >= options.scaleMax) return

            const origo = {x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2}
            const scaleChange = direction * options.scaleStep
            scale = clamp(scale + scaleChange, options.scaleMin, options.scaleMax)

            console.log("Scale:", scale)
            console.log("Origo:", origo)

            elements.forEach(element => {
                const diff = {x: origo.x - element.center.x, y: origo.y - element.center.y}
                const move = {x: diff.x * (1 - scale), y: diff.y * (1 - scale)}

                console.log(element.target.innerText, element.center, diff, move)

                element.setTranslate(element.position.x + move.x, element.position.y + move.y)
                setElementTransform(element.target, element.translate.x, element.translate.y, scale)
            })
        }
    })

    return {
        target: canvas,
        get options() { return opt },

        on(eventName, callback) {
            eventHandlers[eventName] = callback
        },

    }
}


class MouseButton {
    static LEFT = 0
    static RIGHT = 2
}


class Throwable {

    static querySelector(selector) {
        const element = document.querySelector(selector)
        if (element === null)
            throw Error("Could not find canvas element with selector:", selector)
        return element
    }

}


function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min)
}


function forEachElementChild(element, callback) {
    const results = []
    for (const child of element.children) {
        const result = callback(child)
        if (typeof result !== "undefined") {
            results.push(result)
        }
    }
    return results
}


function setElementTransform(element, translateX, translateY, scale) {
    element.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
}


export default {
    createCanvas,
    DEFAULT_OPTIONS,
}