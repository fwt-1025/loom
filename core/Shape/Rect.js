import Shape from './Shape.js'

export default class Rect extends Shape{
    constructor(ctx, shapeProps) {
        super(ctx, shapeProps)
        this.type = 'rect'
    }
    getControlPoints() {
        let [p0, p1] = this.points
        return [
            p0,
            {
                x: (p0.x + p1.x) / 2,
                y: p0.y,
            },
            {
                x: p1.x,
                y: p0.y
            },
            {
                x: p1.x,
                y: (p1.y + p0.y) / 2
            },
            p1,
            {
                x: (p0.x + p1.x) / 2,
                y: p1.y
            },
            {
                x: p0.x,
                y: p1.y
            },
            {
                x: p0.x,
                y: (p0.y + p1.y) / 2
            }
        ]
    }
    /**
     * 
     * @param {*} ms 鼠标开始的位置
     * @param {*} me 鼠标结束的位置
     */
    initPoints(ms, me) {
        // this.points[0] = ms
        // this.points[1] = me
        if (ms.x < me.x && ms.y < me.y) {
            this.points[0] = ms
            this.points[1] = me
        } else if (ms.x < me.x && ms.y > me.y) {
            this.points[0] = {
                x: ms.x,
                y: me.y
            }
            this.points[1] = {
                x: me.x,
                y: ms.y
            }
        } else if (ms.x > me.x && ms.y > me.y) {
            [this.points[0], this.points[1]] = [me, ms]
        } else {
            this.points[0] = {
                x: me.x,
                y: ms.y
            }
            this.points[1] = {
                x: ms.x,
                y: me.y
            }
        }
    }
    drawGraph() {
        let mat = this.ctx.getTransform()
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.strokeStyle = this.lineColor
        let {x: sx, y: sy} = this.points[0]
        let {x: ex, y: ey} = this.points[1]
        sx = sx * mat.a + mat.e
        sy = sy * mat.a + mat.f
        ex = ex * mat.a + mat.e
        ey = ey * mat.a + mat.f
        this.ctx.rect(sx, sy, ex - sx, ey - sy)
        this.ctx.stroke()
        this.ctx.closePath()
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
    isPointInRect(pos) {
        let {x: sx, y: sy} = this.points[0]
        let {x: ex, y: ey} = this.points[1]
        if (sx < pos.x && sy < pos.y && sx + ex - sx > pos.x && sy + ey - sy > pos.y) {
            return this
        }
    }
}