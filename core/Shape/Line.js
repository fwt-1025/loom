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
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.lineWidth = this.lineWidth || 5
        this.ctx.strokeStyle = this.lineColor
        this.points.forEach((item, index) => {
            let { x, y } = item
            x = x * mat.a + mat.e
            y = y * mat.a + mat.f
            if (index === 0) {
                this.ctx.moveTo(x, y)
            } else {
                this.ctx.lineTo(x, y)
            }
        })
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.restore()
        this.activating && this.drawControls()
    }
    isIntersect(type) {
        // 这里type的含义是当多边形结束绘制时，要最后判断一次最后一个点与起始点连成的线是否与其他线段有交点，如果有，不允许结束
        let points = this.points.slice()
        let poly = points.map((p1, i) => [p1, points[(i + 1) % points.length]])
        let intersectLine = poly.slice(poly.length - 3, poly.length - 2)
        let otherLine = poly.slice(-1).concat(poly.slice(0, poly.length - 3))
        let max = Math.max
        let min = Math.min
        let [a, b] = type ? poly.slice(-1)[0] : intersectLine[0]
        for (let i = 0; i < otherLine.length; i++) {
            let [c, d] = otherLine[i]
            if (
                (max(a.x, b.x) > min(c.x, d.x) && min(a.x, b.x) < max(c.x, d.x)) &&
                (max(a.y, b.y) > min(c.y, d.y) && min(a.y, b.y) < max(c.y, d.y))
            ) {
                if (
                    ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (c.x - a.x)) *
                    ((d.x - a.x) * (b.y - a.y) - (d.y - a.y) * (b.x - a.x)) < 0 &&
                    ((a.x - c.x) * (d.y - c.y) - (a.y - c.y) * (d.x - c.x)) *
                    ((b.x - c.x) * (d.y - c.y) - (b.y - c.y) * (d.x - c.x)) < 0
                ) {
                    return true
                }
            }
        }
        return false
    }
    updateGraph(index, pos) {
        this.points[index] = pos
    }
    isPointInPath(pos) {
        // 三角形两边之和大于第三边
        let mat = this.ctx.getTransform()
        let newPoints = this.points.map((p1, i) => [p1, this.points[(i + 1) % this.points.length]]).slice(0, this.points.length - 1)
        for (let i = 0, len = newPoints.length; i < len; i++) {
            let p1 = newPoints[i][0]
            let p2 = newPoints[i][1]
            let l1 = Math.sqrt((Math.pow(pos.x - p1.x, 2) + Math.pow(pos.y - p1.y, 2)));
            let l2 = Math.sqrt((Math.pow(pos.x - p2.x, 2) + Math.pow(pos.y - p2.y, 2)))
            let l3 = Math.sqrt((Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)))
            if (l2 + l1 - l3 < 0.02 / mat.a) {
                // this.canvasmouse.el.style.cursor = 'pointer'
                return this
            }
        }
    }
}