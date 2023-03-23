import Event from './event/event.js'
import Rect from './Shape/Rect.js'
import Polygon from './Shape/Polygon.js'
import Line from './Shape/Line.js'
import Cube from './Shape/Cube.js'
import Point from './Shape/Point.js'
import matrix from './utils/matrix.js'
import { warn, error } from './utils/index.js'
/**
 * 定义事件
 * selectedShape  选中图形触发的事件，回调参数 shape
 * hoverShape     鼠标移动选中图形触发的事件， 回调参数 shape
 * 
 * 
 * 定义抛出的事件
 * deleteByIndex  通过下标删除对应的图形
 * setData        设置画布中的图形数据
 * update         用于修改图形属性后，画布重新绘制
 * getCurrentActiveShape 获取当前选中的图形
 */
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
        imgUrl,
        minScale,
        maxScale,
        focusMode,
        selectTool
    }) {
        super()
        this.el = el
        this.shapeList = []
        this.width = width || window.innerWidth
        this.height = height || window.innerHeight
        this.canvasDOM = null
        this.selectTool = selectTool || 'select'
        this.offsetX = 0
        this.offsetY = 0
        this.img = new Image()
        this.img.src = imgUrl
        this.activeShape = null
        this.scale = 1
        this.minScale = minScale || 0.6
        this.maxScale = maxScale || 40
        this.index = 0
        this.activeIndex = -1
        this.pixelSize = {}
        this.matrix = matrix
        this.focusMode = focusMode || false
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
            this.pixelSize = {
                w: this.img.naturalWidth,
                h: this.img.naturalHeight
            }
            this.imgHeight = this.width / this.pixelRatio // 根据宽度自适应图像
            this.init()
        }
        this.Rect = Rect
        this.Polygon = Polygon
        this.Line = Line
        this.Point = Point
        this.Cube = Cube
    }
    init() {
        if (!this.el) {
            error('You should provide an \'el\' attribute and it needs to be set to \'string | HTMLCanvasElement\'')
            return
        }
        if (this.el instanceof HTMLCanvasElement) {
            this.canvasDOM = this.el
        } else if (typeof this.el === 'string') {
            this.canvasDOM = document.querySelector(this.el)
        }
        this.ctx = this.canvasDOM.getContext('2d')
        this.canvasDOM.width = this.width
        this.canvasDOM.height = this.height
        this.canvasDOM.addEventListener('mousedown', this.handleMouseDown.bind(this))
        this.canvasDOM.addEventListener('mousemove', (e) => {
            debounce(this.handleMouseMove.bind(this, e), 10)
        })
        this.canvasDOM.addEventListener('mouseup', this.handleMouseUp.bind(this))
        this.canvasDOM.addEventListener('mousewheel', this.handleMouseWheel.bind(this))
        // document.addEventListener('keydown', e => {
        //     e.preventDefault()
        //     if (e.key === 'r') {
        //         matrix.reset()
        //         this.ctx.setTransform(matrix.clone())
        //         this.update()
        //     }
        //     if (e.key === 'v') {
        //         this.selectTool = 'select'
        //     }
        //     if (e.key === 'Delete') {
        //         ~this.activeIndex && this.deleteByIndex(this.activeIndex)
        //         this.update()
        //     }
        // })
        document.addEventListener('contextmenu', (e) => {e.preventDefault()})
        this.update()
        this.emit('created')
    }
    setImage(src) {
        this.img.src = src
        this.img.setAttribute("crossOrigin", "anonymous");
        this.img.onload = () => {
            this.pixelRatio = this.img.naturalWidth / this.img.naturalHeight
            this.pixelSize = {
                w: this.img.naturalWidth,
                h: this.img.naturalHeight
            }
            this.imgHeight = this.width / this.pixelRatio
            this.update()
        }
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
    resetCanvas() {
        matrix.reset()
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
        let mousePos = {
            x: (e.clientX - pos.x - matrix.e) / matrix.a,
            y: (e.clientY - pos.y - matrix.f) / matrix.a
        }
        mousePos.x = mousePos.x < 0 ? 0 : mousePos.x > this.width ? this.width : mousePos.x
        mousePos.y = mousePos.y < 0 ? 0 : mousePos.y > this.imgHeight ? this.imgHeight : mousePos.y
        return mousePos
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
            if (this.activeShape && this.activeShape.intersect) {
                return
            }
            if (this.activeShape && ['polygon', 'line'].includes(this.activeShape.type)) {
                if (this.activeShape.points.length > 4 && this.activeShape.type === 'polygon' && this.activeShape.isIntersect('drawOver') && JSON.stringify(this.mouseEventPosition(e)) === JSON.stringify(this.mouse.mousedownPos)) {
                    this.activeShape.points.splice(this.activeShape.points.length - 1, 1)
                    return
                }
                if (JSON.stringify(this.mouseEventPosition(e)) === JSON.stringify(this.mouse.mousedownPos)) {
                    this.activeShape.points.splice(this.activeShape.points.length - 1, 1)
                    // }
                    this.activeShape.creating = false
                    this.activeShape.activating = true
                    this.update()
                    return
                }
                // return
            }
        } else {
            this.dbclickTime = Date.now()
        }
        this.mouse.mousedownPos = this.mouseEventPosition(e)
        if (e.button === 2) {
            this.rightMouseDown = true
            this.setMouseCursor('grab')
            return
        }
        if (this.activeShape && ~this.activeShape.editIndex) {
            this.activeShape.editing = true
            return
        }
        if (this.selectTool === 'select') {
            if (this.activeShape) {
                this.activeShape.activating = false
                // this.activeShape.editing = false
                this.activeShape = null
            }
            if (!~this.activeIndex) {
                this.update()
                return
            }
            this.activeShape = this.shapeList[this.activeIndex]
            this.activeShape.activating = true
            if (this.focusMode) {
                this.setFocusMode()
            }
            this.emit('selectedShape', this.activeShape)
            this.update()
            return
        }
        if (this.activeShape?.creating) {
            switch(this.selectTool) {
                case 'rect':
                    this.activeShape.creating = false
                    this.activeShape.activating = true
                    break
                case 'line':
                case 'polygon':
                    this.activeShape.points.splice(this.activeShape.points.length - 1, 1, this.mouse.mousedownPos, this.mouse.mousedownPos)
                    this.activeShape.intersect = false
                    if (this.activeShape.points.length > 4 && this.activeShape.isIntersect()) {
                        this.activeShape.points.splice(this.activeShape.points.length - 1, 1)
                        this.activeShape.intersect = true
                    }
                    break
                case 'cube':
                    if (this.activeShape.points.length === 3) {
                        this.activeShape.creating = false
                        break
                    }
                    this.activeShape.points.splice(this.activeShape.points.length - 1, 1, this.mouse.mousedownPos, this.mouse.mousedownPos)
                    break
            }
            this.update()
            return
        }
        if (this.selectTool) {
            this.activeShape && (this.activeShape.activating = false)
            this.activeShape = this.createShape(this.selectTool, this.shapeProps || {})
            this.activeShape.creating = true
            this.addShape(this.activeShape)
        }
    }
    handleMouseMove(e) {
        this.mouse.mousemovePos = this.mouseEventPosition(e)
        if (this.rightMouseDown) {
            this.setMouseCursor('grabbing')
            let offsetX = this.mouse.mousemovePos.x - this.mouse.mousedownPos.x
            let offsetY = this.mouse.mousemovePos.y - this.mouse.mousedownPos.y
            matrix.translate(offsetX, offsetY)
            this.ctx.setTransform(matrix.clone())
            this.update()
            console.log(matrix.clone())
            return
        }
        if (this.activeShape && this.activeShape.editing) {
            this.activeShape.updateGraph(this.activeShape.editIndex, this.mouse.mousemovePos)
            this.update()
            return
        }
        if (this.activeShape && this.activeShape.activating) {
            this.activeShape.editIndex = this.activeShape.controlPointsIndex(this.mouse.mousemovePos)
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
            this.activeIndex = item.index
            this.emit('hoverShape', item)
        } else {
            for (let i = 0; i < activeShapeList.length; i++) {
                let item = activeShapeList[i]
                if (item.type === 'line') {
                    item.activating = true
                    this.activeIndex = item.index
                    this.update()
                    this.emit('hoverShape', item)
                    return
                }
                let itemArea = item.getArea()
                if (minArea) {
                    if (itemArea < minArea) {
                        item.activating = true
                        this.activeIndex = item.index
                        this.update()
                        this.emit('hoverShape', item)
                        return
                    }
                } else {
                    minArea = itemArea
                    item.activating = true
                    this.activeIndex = item.index
                    this.update()
                    this.emit('hoverShape', item)
                }
            }
        }
        this.update()
        return
    }
    handleMouseUp() {
        if (this.rightMouseDown) {
            this.setMouseCursor('auto')
            this.rightMouseDown = false
        }
        if (this.activeShape && this.activeShape.editing) {
            this.activeShape.editing = false
        }
    }
    setFocusMode() {
        let {x:cx, y:cy} = this.activeShape.getShapeCenter()
        let {max, min} = this.activeShape.getMaxAndMinmun()
        let {w, h} = {w: this.width, h: this.height}
        let scale = Math.floor(h / (max.y - min.y)) - 0.3
        matrix.reset()
        matrix.scaleU(scale)
        matrix.e += (w / 2) - cx * matrix.a
        matrix.f += (h / 2) - cy * matrix.a
        this.ctx.setTransform(matrix.clone())
        this.update()
    }
    createShape(tool, shapeProps) {
        let newShape = null
        let Shape = this[tool.slice(0, 1).toUpperCase() + tool.slice(1)]
        newShape = new Shape(this.ctx, shapeProps)
        return newShape
    }
    setMouseCursor(mouseStyle) {
        this.canvasDOM.style.cursor = mouseStyle
    }
    setData(data) {
        this.shapeList = []
        let newShape = null
        data.forEach(item => {
            item.points.forEach(item => {
                item.x = item.x / this.img.naturalWidth * this.width
                item.y = item.y / this.img.naturalHeight * this.imgHeight
            })
            newShape = this.createShape(item.type, item)
            this.shapeList.push(newShape)
        })
        this.update()
    }
    deleteByIndex(index) {
        this.shapeList.splice(index, 1)
    }
    getResultData() {
        let regions = this.shapeList.map(item => {
            return item.getData()
        })
        return {
            pixelSize: this.pixelSize,
            regions
        }
    }
    destory() {
        this.canvasDOM.removeEventListener('mousedown', this.handleMouseDown.bind(this))
        this.canvasDOM.removeEventListener('mousemove', (e) => {
            debounce(this.handleMouseMove.bind(this, e), 10)
        })
        this.canvasDOM.removeEventListener('mouseup', this.handleMouseUp.bind(this))
        this.canvasDOM.removeEventListener('mousewheel', this.handleMouseWheel.bind(this))
        document.removeEventListener('keydown', e => {
            if (e.key === 'r') {
                matrix.reset()
                this.ctx.setTransform(matrix.clone())
                this.update()
            }
            if (e.key === 'v') {
                this.selectTool = 'select'
            }
        })
        document.removeEventListener('contextmenu', (e) => {e.preventDefault()})
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