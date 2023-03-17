import Event from './event/event.js'
import Rect from './Shape/Rect.js'
import matrix from './utils/matrix.js'
/**
 * init Canvas
 */
// let activeShape = null

class Canvas extends Event {
    rightMouseDown = false
    rightMouseMove = false
    constructor({
        el,
        width,
        height,
        imgUrl
    }) {
        super()
        this.el = el
        this.shapeList = []
        this.width = width || window.innerWidth
        this.height = height || window.innerHeight
        this.canvasDOM = null
        this.createType = ''
        this.offsetX = 0
        this.offsetY = 0
        this.img = new Image()
        this.img.src = imgUrl
        this.activeShape = null
        this.scale = 1
        this.minScale = 0.6
        this.maxScale = 40
        this.baseScaleStep = .5
        this.mouse = {
            mousedownPos: {
                x: 0,
                y: 0
            },
            mousemovePos: {
                x: 0,
                y: 0
            },
            mouseupPos: {
                x: 0,
                y: 0
            },
            mousewheelPos: {
                x: 0,
                y: 0
            }
        }
        this.img.setAttribute("crossOrigin", "anonymous");
        this.img.onload = () => {
            this.pixelRatio = this.img.naturalWidth / this.img.naturalHeight
            this.imgHeight = this.width / this.pixelRatio // 根据宽度自适应图像
            this.init()
        }
    }
    init() {
        this.canvasDOM = document.querySelector(this.el)
        this.ctx = this.canvasDOM.getContext('2d')
        this.canvasDOM.width = this.width
        this.canvasDOM.height = this.height
        this.canvasDOM.addEventListener('mousedown', this.handleMouseDown.bind(this))
        this.canvasDOM.addEventListener('mousemove', (e) => {
            debounce(this.handleMouseMove.bind(this, e), 10)
        })
        this.canvasDOM.addEventListener('mouseup', this.handleMouseUp.bind(this))
        this.canvasDOM.addEventListener('mousewheel', this.handleMouseWheel.bind(this))
        document.addEventListener('keydown', e => {
            if (e.key === 'r') {
                matrix.reset()
                this.ctx.setTransform(matrix.clone())
                this.update()
            }
        })
        document.addEventListener('contextmenu', (e) => {e.preventDefault()})
        this.update()
        this.emit('created')
    }
    fitInWindow() {
        matrix.reset()
        matrix.scaleU(.65)
        let ox = (this.width - this.width * 0.65) / 2
        let oy = (this.height - this.imgHeight * 0.65) / 2
        matrix.translate(ox, oy)
        this.ctx.setTransform(matrix.clone())
        this.update()
    }
    addShape(shape) {
        this.shapeList.push(shape)
    }
    update() {
        this.clear()
        this.ctx.drawImage(this.img, 0, 0, this.width, this.imgHeight)
        this.shapeList.forEach(item => {
            item.drawGraph()
        })
    }
    clear() {
        this.ctx.save()
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.ctx.restore()
    }
    getCurrentActiveShape() {
        // 获取当前激活的图形
        let activating = this.shapeList.filter(item => item.active)
        return activating.length ? activating[0] : null
    }
    mouseEventPosition(e) {
        let pos = this.canvasDOM.getBoundingClientRect()
        return {
            x: (e.clientX - pos.x - matrix.e) / matrix.a,
            y: (e.clientY - pos.y - matrix.f) / matrix.a,
            width: pos.width,
            height: pos.height
        }
    }
    handleMouseWheel(e) {
        let {x, y} = this.mousewheelPos = this.mouseEventPosition(e)
        // let ratio = 1.1
        let v = e.deltaY < 0 ? 1 : -1
        let scale = 1 + 0.2 * v
        // let s = this.scale // 设s为上次缩放比例
        // this.scale = Number(this.scale.toFixed(1))
        // this.scale += v
        // this.scale = this.scale < 0.5 ? 0.5 : this.scale > 4 ? 4 : this.scale
        // let s1 = this.scale // 设s1为本次缩放比例
        // let dx = (1 - s1 / s) * (x - matrix.e)
        // let dy = (1 - s1 / s) * (y - matrix.f)
        // matrix.e += dx
        // matrix.f += dy
        matrix.translate(x, y).scaleU(scale);
        if (matrix.a < 0.3) matrix.scaleU(0.3 / matrix.a);
        if (matrix.a > 40) matrix.scaleU(40 / matrix.a);
        matrix.translate(-x, -y);
        this.ctx.setTransform(matrix.clone())
        this.update()
    }
    handleMouseDown(e) {
        e.preventDefault()
        this.mouse.mousedownPos = this.mouseEventPosition(e)
        console.log(this.mouse.mousedownPos)
        if (e.button === 2) {
            console.log('right click')
            this.rightMouseDown = true
            return
        }
        if (this.activeShape?.creating) {
            switch(this.createType) {
                case 'rect':
                    this.activeShape.creating = false
                    this.activeShape.editing = true
                    break
                }
            this.update()
            return
        }
        if (this.createType) {
            this.activeShape && (this.activeShape.editing = false)
            switch(this.createType) {
                case 'rect':
                    this.activeShape = new Rect(this.ctx, {
                        lineColor: '#00f'
                    })
                    this.activeShape.creating = true
                    this.activeShape.activating = true
                    break
                case 'polygon':
                    this.activeShape = new Polygon(this.ctx, {})
                    break
            }
            this.addShape(this.activeShape)
        }
    }
    handleMouseMove(e) {
        this.mouse.mousemovePos = this.mouseEventPosition(e)
        if (this.rightMouseDown) {
            let offsetX = this.mouse.mousemovePos.x - this.mouse.mousedownPos.x
            let offsetY = this.mouse.mousemovePos.y - this.mouse.mousedownPos.y
            matrix.translate(offsetX, offsetY)
            this.ctx.setTransform(matrix.clone())
            this.update()
        }
        if (this.activeShape?.creating) {
            switch(this.createType) {
                case 'rect':
                    this.activeShape.initPoints(this.mouse.mousedownPos, this.mouse.mousemovePos)
                    break
                }
            this.update()
        }
    }
    handleMouseUp() {
        this.rightMouseDown = false
    }
    setData(data) {
        let newShape = null
        data.forEach(item => {
            switch(item.type) {
                case 'rect':
                    newShape = new Rect(this.ctx, item)
                    break
                case 'polygon':
                    newShape = new Polygon(this.ctx, item)
                    break
            }
            this.shapeList.push(newShape)
        })
        this.update()
    }
}

let time = 0
function debounce(fn, delay) {
    if (!time) {
        fn()
        time = Date.now()
    }
    if (Date.now() - time < delay) {
        return
    }
    fn()
    time = Date.now()
}


export default Canvas