import { MouseButton, clamp, forEachElementChild } from "./util.js"
import CanvasElement from "./canvas-element.js"


export const DEFAULT_CANVAS_OPTIONS = {

    // Scaling / Zooming
    initialScale: 1,
    scaleMax: 1.5,
    scaleMin: 0.5,
    scaleStep: 0.1,

    // Transitions
    moveTransition: "",
    scaleTransition: "",

    // Should drag commence? (MouseEvent)
    validateDrag: (event, element) => {
        return event.ctrlKey && event.button === MouseButton.LEFT
    },

    // Should pan commence? (MouseEvent)
    validatePan: event => {
        return event.ctrlKey && event.button === MouseButton.RIGHT
    },

    // Should zoom commence? (WheelEvent)
    validateZoom: event => {
        return event.ctrlKey
    },

}


export class Canvas {

    _cursorPosition = null
    _eventHandlers = {}
    _panning = false
    _recentlyStoppedPanning = false
    _scale = 1

    constructor(htmlElement, options) {
        this.target = htmlElement
        this.options = options
        this._scale = options.initialScale
        this.target.style.overflow = "hidden"
        this.elements = this.getCanvasElements()
        this._addEventListeners()
    }

    _addEventListeners() {

        this.target.addEventListener("contextmenu", event => {
            if (this._recentlyStoppedPanning) {
                event.preventDefault()
                this._recentlyStoppedPanning = false
            }
        })

        document.addEventListener("contextmenu", event => {
            if (this._recentlyStoppedPanning) {
                event.preventDefault()
                this._recentlyStoppedPanning = false
            }
        })

        this.target.addEventListener("mousedown", event => {
            if (this.options.validatePan(event)) {
                event.preventDefault()
                this.dispatchEvent("panstart", event)
                this._panning = true
            }
        })

        this.target.addEventListener("mousemove", event => {
            this.cursorPosition = this.getCursorPosition(event)
        })

        document.addEventListener("mousemove", event => {
            if (this._panning) {
                event.preventDefault()
                this.dispatchEvent("panmove", event)
                this.elements.forEach(element => {
                    element.positionBy(event.movementX, event.movementY)
                    element.translateBy(event.movementX, event.movementY)
                    element.render()
                })
            }
        })

        document.addEventListener("mouseup", event => {
            if (this._panning) {
                event.preventDefault()
                this.dispatchEvent("panend", event)
                this._panning = false
                this._recentlyStoppedPanning = true
            }
        })

        this.target.addEventListener("wheel", event => {
            if (this.options.validateZoom(event)) {
                event.preventDefault()
                this.dispatchEvent("zoom", event)
                const direction = -event.deltaY * 0.01
                this._onZoom(direction, direction * this.options.scaleStep)
            }
        })

    }

    _onZoom(direction, scaleChange) {

        if (direction === -1 && this._scale - scaleChange <= this.options.scaleMin) return
        if (direction === 1 && this._scale + scaleChange >= this.options.scaleMax) return

        this._scale = clamp(this._scale + scaleChange, this.options.scaleMin, this.options.scaleMax)

        this.elements.forEach(element => {
            const diff = {x: this.origo.x - element.center.x, y: this.origo.y - element.center.y}
            const move = {x: diff.x * (1 - this._scale), y: diff.y * (1 - this._scale)}
            element.setTranslate(element.position.x + move.x, element.position.y + move.y)
            element.setScale(this._scale)
            element.setTransition(this.options.scaleTransition)
            element.render()
        })
    }

    get origo() {
        return {
            x: this.target.offsetWidth / 2,
            y: this.target.offsetHeight / 2,
        }
    }

    dispatchEvent(eventName, ...args) {
        if (this._eventHandlers[eventName]) {
            this._eventHandlers[eventName](...args)
        }
    }

    getCanvasElements() {
        return forEachElementChild(this.target, element => {
            return new CanvasElement(element, this.dispatchEvent.bind(this), this.options)
        })
    }

    getCursorPosition(event) {
        const position = {x: event.offsetX, y: event.offsetY}
        let element = event.target
        while (element && element !== this.target) {
            position.x += element.offsetLeft
            position.y += element.offsetTop
            element = element.parentElement
        }
        return position
    }

    on(eventName, callback) {
        this._eventHandlers[eventName] = callback
    }

    reload() {
        this.elements = this.getCanvasElements()
    }

    setScale(scale) {
        this._scale = scale
        this._onZoom(1, 0)
    }

    zoomIn(x) {
        x = x ?? this.options.scaleStep
        this._onZoom(1, x)
    }

    zoomOut(x) {
        x = x ?? this.options.scaleStep
        this._onZoom(-1, -x)
    }

}