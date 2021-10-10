/**
 * CanvasElement represents an element on a canvas.
 */
export default class CanvasElement {

    _position = {x: 0, y: 0}
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
            }
        })

        document.addEventListener("mousemove", event => {
            if (this._dragging) {
                event.preventDefault()
                this.dispatchEvent("dragmove", event, this)
                this.positionBy(event.movementX, event.movementY)
                this.translateBy(event.movementX * this._scale, event.movementY * this._scale)
                this.render()
            }
        })

        document.addEventListener("mouseup", event => {
            if (this._dragging) {
                event.preventDefault()
                this.dispatchEvent("dragend", event, this)
                this._dragging = false
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
    }

    setTranslate(x, y) {
        this._translate.x = x
        this._translate.y = y
    }

    setScale(x) {
        this._scale = x
    }

    setTransform(translateX, translateY, scale) {
        this._translate.x = translateX ?? this._translate.x
        this._translate.y = translateY ?? this._translate.y
        this._scale = scale ?? this._scale
    }

    positionBy(x, y) {
        this._position.x += x ?? 0
        this._position.y += y ?? 0
    }

    translateBy(x, y) {
        this._translate.x += x ?? 0
        this._translate.y += y ?? 0
    }

    moveBy(x, y) {
        this.positionBy(x, y)
        this.translateBy(x, y)
    }

    scaleBy(x) {
        this._scale += x ?? 0
    }

    render() {
        const tx = this._translate.x, ty = this._translate.y, sc = this._scale
        this.target.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`
    }

}