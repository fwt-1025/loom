import Shape from './Shape.js'

export default class Rect extends Shape{
    constructor(ctx, shapeProps) {
        super(ctx, shapeProps)
        this.type = 'rect'
        this.width = shapeProps.width || 0
        this.height = shapeProps.height || 0
        this.left = shapeProps.left || 0
        this.top = shapeProps.top || 0
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
        let {width, height, left, top} = this
        if (!(0 in this.points) && width && height && left && top) {
            this.points = [
                {x: left, y: top},
                {x: left + width, y: top + height}
            ]
        }
        let mat = this.ctx.getTransform()
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.strokeStyle = this.lineColor
        this.ctx.fillStyle = this.lineColor
        this.ctx.lineWidth = this.lineWidth
        let {x: sx, y: sy} = this.points[0]
        let {x: ex, y: ey} = this.points[1]
        sx = sx * mat.a + mat.e
        sy = sy * mat.a + mat.f
        ex = ex * mat.a + mat.e
        ey = ey * mat.a + mat.f
        this.ctx.rect(sx, sy, ex - sx, ey - sy)
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.globalAlpha = this.opacity
        this.ctx.fill()
        this.ctx.restore()
        this.activating && this.drawControls()
    }
    getArea() {
        let {x, y} = this.points[0]
        let { x: x1, y: y1 } = this.points[1]
        return (x1 - x) * (y1 - y)
    }
    isPointInPath(pos) {
        let {x: sx, y: sy} = this.points[0]
        let {x: ex, y: ey} = this.points[1]
        if (sx < pos.x && sy < pos.y && sx + ex - sx > pos.x && sy + ey - sy > pos.y) {
            return true
        } else {
            return false
        }
    }
    updateGraph(index, pos) {
        let {x, y} = pos
        switch(index) {
            case 0:
                this.points[0] = pos
                break
            case 1:
                this.points[0].y = y
                break
            case 2:
                this.points[0].y = y
                this.points[1].x = x
                break
            case 3:
                this.points[1].x = x
                break
            case 4:
                this.points[1] = pos
                break
            case 5:
                this.points[1].y = y
                break
            case 6:
                this.points[0].x = x
                this.points[1].y = y
                break
            case 7:
                this.points[0].x = x
                break
        }
    }
    // controlPointsIndex(pos) {
    //     let controlPoints = this.getControlPoints()
    //     let {x, y} = pos
    //     let canvas = this.ctx.canvas
    //     let mat = this.ctx.getTransform()
    //     for (let i = 0; i < controlPoints.length; i++) {
    //         let {x: sx, y: sy} = controlPoints[i]
    //         if (x < sx + 5 / mat.a && x > sx - 5 / mat.a && y < sy + 5 / mat.a && y > sy - 5 / mat.a) {
    //             // switch (i) {
    //             //     case 0:
    //             //         canvas.el.style.cursor = ''
    //             // }
    //             canvas.style.cursor = 'pointer'
    //             return i
    //         } else {
    //             canvas.style.cursor = 'auto'
    //         }
    //     }
    //     return -1
    // }
}