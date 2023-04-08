import Event from "../event/event.js"

/**
 * Shape base
 */

export default class Shape extends Event{
    constructor(ctx, {
        points,
        lineColor,
        fillColor,
        lineWidth,
        control,
        opacity,
        uuid
    }) {
        super()
        this.ctx = ctx
        this.index = -1
        this.opacity = opacity || 0.2
        this.editIndex = -1
        this.points = points || []
        this.control = control || true
        this.controlPoints = []
        this.lineColor = lineColor || '#f00'
        this.fillColor = fillColor || '#f00'
        this.lineWidth = lineWidth || 3
        this.creating = false
        this.editing = false
        this.activating = false
        this.uuid = uuid || Math.random()
        this.canDrag = true
    }
    controlPointsIndex(pos) {
        let controlPoints = this.getControlPoints()
        let {x, y} = pos
        let canvas = this.ctx.canvas
        let mat = this.ctx.getTransform()
        for (let i = 0; i < controlPoints.length; i++) {
            let {x: sx, y: sy} = controlPoints[i]
            if (x < sx + 5 / mat.a && x > sx - 5 / mat.a && y < sy + 5 / mat.a && y > sy - 5 / mat.a) {
                canvas.style.cursor = 'pointer'
                return i
            } else {
                canvas.style.cursor = 'auto'
            }
        }
        return -1
    }
    drawControls() {
        let mat = this.ctx.getTransform()
        this.ctx.save()
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.getControlPoints().forEach(item => {
            this.ctx.beginPath()
            this.ctx.strokeStyle = this.lineColor
            this.ctx.fillStyle = '#fff'
            this.ctx.arc(item.x * mat.a + mat.e, item.y * mat.a + mat.f, 5, 0, 2 * Math.PI)
            this.ctx.stroke()
            this.ctx.fill()
            this.ctx.closePath()
        })
        this.ctx.restore()
    }
    drawText() {
        if (!this.points.length) return
        let ctx = this.ctx
        let mat = ctx.getTransform()
        let textwhInfo = ctx.measureText(this.type)
        let {x, y} = this.points[0]
        x = x * mat.a + mat.e + 10
        y = y * mat.a + mat.f
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.font = '14px 微软雅黑'
        ctx.beginPath()
        ctx.save()
        ctx.fillStyle = this.lineColor
        ctx.fillRect(x + 10, y, textwhInfo.width + textwhInfo.actualBoundingBoxAscent * 2, 20)
        ctx.restore()
        ctx.fillStyle = '#fff'
        ctx.fillText(this.type, x + 10, y + 14)
        ctx.closePath()
        ctx.restore()
    }
    getData() {
        let obj = {
            coordinates: this.points,
            type: this.type,
            uuid: this.uuid
        }
        if (this.rotate) {
            obj = Object.assign(obj, {
                angle: this.angle
            })
        }
        return obj
    }
}