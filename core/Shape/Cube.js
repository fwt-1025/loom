import Shape from './Shape.js'

export default class Line extends Shape{
    constructor(ctx, shapeProps) {
        super(ctx, shapeProps)
        this.type = 'line'
    }
    getControlPoints() {
        return this.points
    }
    /**
     * 
     * @param {*} ms 鼠标开始的位置
     * @param {*} me 鼠标结束的位置
     */
    initPoints(ms, me) {
        if (this.points.length > 1) {
            this.points.splice(this.points.length - 1, 1, me)
            return
        }
        this.points = [ms, me]
    }
    drawGraph() {
        let mat = this.ctx.getTransform()
        let ctx = this.ctx
        ctx.save()
        ctx.beginPath()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.strokeStyle = this.lineColor
        let [pos1, pos2, pos3] = this.points
        let { x: x1, y: y1 } = pos1
        let { x: x2, y: y2 } = pos2
        x1 = x1 * mat.a + mat.e
        y1 = y1 * mat.a + mat.f
        x2 = x2 * mat.a + mat.e
        y2 = y2 * mat.a + mat.f
        ctx.rect(x1, y1, x2 - x1, y2 - y1)
        ctx.stroke()
        ctx.closePath()
        if (pos3) {
            ctx.beginPath()
            let { x: x3, y: y3 } = pos3
            x3 = x3 * mat.a + mat.e
            y3 = y3 * mat.a + mat.f
            ctx.rect(x1 + x3 - x2, y1 + y3 - y2, x2 - x1, y2 - y1)
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x1 + x3 - x2, y1 + y3 - y2)
            ctx.moveTo(x2, y1)
            ctx.lineTo(x2 + x3 - x2, y1 + y3 - y2)
            ctx.moveTo(x1, y2)
            ctx.lineTo(x1 + x3 - x2, y3)
            ctx.moveTo(x2, y2)
            ctx.lineTo(x2 + x3 - x2, y3)
            ctx.stroke()
            ctx.closePath()
        }
        this.ctx.restore()
        this.editing && this.drawControls()
    }
    drawControls() {
        let mat = this.ctx.getTransform()
        this.ctx.save()
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.getControlPoints().forEach(item => {
            this.ctx.beginPath()
            this.ctx.fillStyle = this.fillColor
            this.ctx.arc(item.x * mat.a + mat.e, item.y * mat.a + mat.f, 5, 0, 2 * Math.PI)
            this.ctx.fill()
            this.ctx.closePath()
        })
        this.ctx.restore()
    }
    isPointInPath(pos) {
        // console.log(pos.x, pos.y)
        let offscreenCanvas = document.createElement('canvas')
        let ctx = offscreenCanvas.getContext('2d')
        ctx.setTransform(this.ctx.getTransform())
        let mat = ctx.getTransform()
        console.log(mat, pos.x, pos.y)
        ctx.save()
        ctx.beginPath()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.strokeStyle = this.lineColor
        let [pos1, pos2, pos3] = this.points
        let { x: x1, y: y1 } = pos1
        let { x: x2, y: y2 } = pos2
        x1 = x1 * mat.a + mat.e
        y1 = y1 * mat.a + mat.f
        x2 = x2 * mat.a + mat.e
        y2 = y2 * mat.a + mat.f
        ctx.rect(x1, y1, x2 - x1, y2 - y1)
        ctx.stroke()
        ctx.closePath()
        if (pos3) {
            ctx.beginPath()
            let { x: x3, y: y3 } = pos3
            x3 = x3 * mat.a + mat.e
            y3 = y3 * mat.a + mat.f
            ctx.rect(x1 + x3 - x2, y1 + y3 - y2, x2 - x1, y2 - y1)
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x1 + x3 - x2, y1 + y3 - y2)
            ctx.moveTo(x2, y1)
            ctx.lineTo(x2 + x3 - x2, y1 + y3 - y2)
            ctx.moveTo(x1, y2)
            ctx.lineTo(x1 + x3 - x2, y3)
            ctx.moveTo(x2, y2)
            ctx.lineTo(x2 + x3 - x2, y3)
            ctx.stroke()
            ctx.closePath()
        }
        ctx.restore()
        if (ctx.isPointInPath(pos.x, pos.y)) {
            console.log(1231231)
        }
    }
}