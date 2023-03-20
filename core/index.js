import Event from './event/event.js'
import Rect from './Shape/Rect.js'
import Polygon from './Shape/Polygon.js'
import Line from './Shape/Line.js'
import Cube from './Shape/Cube.js'
import matrix from './utils/matrix.js'
/**
 * init Canvas
 */
// let activeShape = null

class Canvas extends Event {
    rightMouseDown = false
    rightMouseMove = false
    dbclickTime = 0
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
        this.selectTool = ''
        this.offsetX = 0
        this.offsetY = 0
        this.img = new Image()
        this.img.src = imgUrl
        this.activeShape = null
        this.scale = 1
        this.minScale = 0.6
        this.maxScale = 40
        this.baseScaleStep = .5
        this.index = 0
        this.activeIndex = -1
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
            if (e.key === 'v') {
                this.selectTool = 'select'
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
        this.shapeList.forEach((item, index) => {
            item.index = index
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
        let activating = this.shapeList.filter(item => item.activating)
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
        if (this.dbclickTime && (Date.now() - this.dbclickTime < 300)) { // 用户判断用户双击结束绘制
            if (this.activeShape && ['polygon', 'line'].includes(this.activeShape.type) && JSON.stringify(this.mouseEventPosition(e)) === JSON.stringify(this.mouse.mousedownPos)) {
                this.activeShape.creating = false
                this.activeShape.editing = true
                this.update()
                return
            }
        } else {
            this.dbclickTime = Date.now()
        }
        this.mouse.mousedownPos = this.mouseEventPosition(e)
        if (e.button === 2) {
            this.rightMouseDown = true
            return
        }
        if (this.selectTool === 'select') {
            if (this.activeShape) {
                this.activeShape.activating = false
                this.activeShape.editing = false
                this.activeShape = null
            }
            if (!~this.activeIndex) {
                this.update()
                return
            }
            this.activeShape = this.shapeList[this.activeIndex]
            this.activeShape.activating = true
            this.activeShape.editing = true
            this.update()
            return
        }
        if (this.activeShape?.creating) {
            switch(this.selectTool) {
                case 'rect':
                    this.activeShape.creating = false
                    this.activeShape.editing = true
                    break
                case 'line':
                case 'polygon':
                    this.activeShape.points.splice(this.activeShape.points.length - 1, 1, this.mouse.mousedownPos, this.mouse.mousedownPos)
                    break
                case 'cube':
                    if (this.activeShape.points.length === 3) {
                        this.activeShape.creating = false
                        this.activeShape.activating = true
                        this.activeShape.editing = true
                        break
                    }
                    this.activeShape.points.splice(this.activeShape.points.length - 1, 1, this.mouse.mousedownPos, this.mouse.mousedownPos)
                    break
                }

            this.update()
            return
        }
        if (this.selectTool) {
            this.activeShape && (this.activeShape.editing = false)
            this.activeShape = this.createShape(this.selectTool, this.shapeProps || {})
            this.activeShape.creating = true
            this.activeShape.activating = true
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
        if (this.selectTool === 'select') {
            this.selectShape()
        }
        if (this.activeShape?.creating) {
            switch(this.selectTool) {
                case 'rect':
                    this.activeShape.initPoints(this.mouse.mousedownPos, this.mouse.mousemovePos)
                    break
                case 'line':
                case 'polygon':
                case 'cube':
                    this.activeShape.initPoints(this.mouse.mousedownPos, this.mouse.mousemovePos)
                    break
            }
            this.update()
        }
    }
    selectShape() {
        let activeShapeList = this.shapeList.filter(item => {
            if (!this.activeShape || item.uuid !== this.activeShape.uuid) {
                item.activating = false
                item.editing = false
            }
            return item.isPointInPath(this.mouse.mousemovePos)
        })
        if (!activeShapeList.length) {
            this.activeIndex = -1
        }
        let minArea = 0
        /**
         * 会有覆盖关系，如果小面积的图形被大面积的图形覆盖，小面积的图形将无法被选中，此处使用面积比较，来区分选中的图形。
         */
        if (activeShapeList.length === 1) {
            let item = activeShapeList[0]
            item.activating = true
            item.editing = true
            this.activeIndex = item.index
        } else {
            for (let i = 0; i < activeShapeList.length; i++) {
                let item = activeShapeList[i]
                if (item.type === 'line') {
                    item.activating = true
                    item.editing = true
                    this.activeIndex = item.index
                    this.update()
                    return
                }
                let itemArea = item.getArea()
                if (minArea) {
                    if (itemArea < minArea) {
                        item.activating = true
                        item.editing = true
                        this.activeIndex = item.index
                        this.update()
                        return
                    }
                } else {
                    minArea = itemArea
                    item.activating = true
                    item.editing = true
                    this.activeIndex = item.index
                    this.update()
                }
            }
        }
        this.update()
        return
    }
    handleMouseUp() {
        this.rightMouseDown = false
    }
    createShape(tool, shapeProps) {
        let newShape = null
        switch(tool) {
            case 'rect':
                newShape = new Rect(this.ctx, shapeProps)
                break
            case 'polygon':
                newShape = new Polygon(this.ctx, shapeProps)
                break
            case 'line':
                newShape = new Line(this.ctx, shapeProps)
                break
            case 'point':
                newShape = new Point(this.ctx, shapeProps)
                break
            case 'cube':
                newShape = new Cube(this.ctx, shapeProps)
                break
        }
        return newShape
    }
    setData(data) {
        let newShape = null
        data.forEach(item => {
            newShape = this.createShape(item.type, item)
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