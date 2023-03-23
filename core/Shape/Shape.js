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
    getData() {
        return {
            coordinates: this.points,
            type: this.type,
            uuid: this.uuid
        }
    }
}