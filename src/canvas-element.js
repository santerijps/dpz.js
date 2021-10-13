/**
 * CanvasElement represents an element on a canvas.
 */
export default class CanvasElement {

    _position = {x: 0, y: 0}
    _translate0 = {x: 0, y: 0}
    _translate = {x: 0, y: 0}
    _scale = 1
    _dragging = false

    /**
     * Creates a new `CanvasElement` instance and adds the required event listeners.
     * @param {*} htmlElement The HTML element
     * @param {*} eventDispatcher The `Canvas` event dispatcher function
     * @param {*} options 
     */
    constructor(htmlElement, eventDispatcher, options) {
        this.target = htmlElement
        this.dispatchEvent = eventDispatcher
        this.options = options
        this._addEventListeners()
    }

    _addEventListeners() {

        this.target.addEventListener("mousedown", event => {
            if (this.options.validateDrag(event, this.target)) {
                event.preventDefault()
                this.dispatchEvent("dragstart", event, this)
                this._dragging = true
                this._translate0 = {x: this._translate.x, y: this._translate.y}
            }
        })

        document.addEventListener("mousemove", event => {
            if (this._dragging) {
                event.preventDefault()
                this.dispatchEvent("dragmove", event, this)
                this.translateBy(event.movementX, event.movementY)
                this.render()
            }
        })

        document.addEventListener("mouseup", event => {
            if (this._dragging) {
                event.preventDefault()
                this.dispatchEvent("dragend", event, this)
                this._dragging = false
                const deltaX = (this._translate.x - this._translate0.x) / this._scale
                const deltaY = (this._translate.y - this._translate0.y)  / this._scale
                this.positionBy(deltaX, deltaY)
            }
        })

    }

    get position() {
        return this._position
    }

    get translate() {
        return this._translate
    }

    get scale() {
        return this._scale
    }

    get offset() {
        return {
            x: this.target.offsetLeft + this.position.x,
            y: this.target.offsetTop + this.position.y,
        }
    }

    get center() {
        return {
            x: this.offset.x + this.target.offsetWidth / 2,
            y: this.offset.y + this.target.offsetHeight / 2,
        }
    }

    setPosition(x, y) {
        this._position.x = x
        this._position.y = y
        return this
    }

    setTranslate(x, y) {
        this._translate.x = x
        this._translate.y = y
        return this
    }

    setScale(x) {
        this._scale = x
        return this
    }

    setTransform(translateX, translateY, scale) {
        this._translate.x = translateX ?? this._translate.x
        this._translate.y = translateY ?? this._translate.y
        this._scale = scale ?? this._scale
        return this
    }

    positionBy(x, y) {
        this._position.x += x ?? 0
        this._position.y += y ?? 0
        return this
    }

    translateBy(x, y) {
        this._translate.x += x ?? 0
        this._translate.y += y ?? 0
        return this
    }

    moveBy(x, y) {
        x = x ?? 0
        y = y ?? 0
        this.positionBy(x, y)
        this.translateBy(x * this._scale, y * this._scale)
        return this
    }

    scaleBy(x) {
        this._scale += x ?? 0
        return this
    }

    render() {
        const tx = this._translate.x, ty = this._translate.y, sc = this._scale
        this.target.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`
        return this
    }

}