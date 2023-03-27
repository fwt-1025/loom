import Shape from './Shape.js'

export default class Polygon extends Shape{
    constructor(ctx, shapeProps) {
        super(ctx, shapeProps)
        this.type = 'polygon'
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
        this.ctx.strokeStyle = this.lineColor
        this.ctx.fillStyle = this.lineColor
        this.ctx.lineWidth = this.lineWidth
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
        this.ctx.save()
        this.ctx.globalAlpha = this.opacity
        this.ctx.fill()
        this.ctx.restore()
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
        this.activating && this.drawControls()
    }
    getArea() {
        // 通过定义一个点，根据三角形的求面积公式， 两条向量的叉积的膜 / 2, 将多边形分成若干个三角形。
        // 面积公式 S = 0.5 * | x1*y2 - y1*x2 + x2 * y3 - y2*x3 + ..... + xn*y1 - yn*x1 |
        let newPoints = this.points.map((item, index) => [item, this.points[(index + 1) % this.points.length]])
        let S = 0
        for (let i = 0, len = newPoints.length; i < len; i++) {
            let item = newPoints[i]
            S += (item[0].x * item[1].y - item[0].y * item[1].x)
        }
        S = Math.abs(S / 2)
        return S
    }
    getMaxAndMinmun() {
        let xList = []
        let yList = []
        this.points.forEach(item => {
            xList.push(item.x)
            yList.push(item.y)
        })
        let maxX = Math.max.apply(null, xList)
        let minX = Math.min.apply(null, xList)
        let maxY = Math.max.apply(null, yList)
        let minY = Math.min.apply(null, yList)
        return {
            max: {
                x: maxX,
                y: maxY
            },
            min: {
                x: minX,
                y: minY
            }
        }
    }
    getShapeCenter() {
        let {max, min} = this.getMaxAndMinmun()
        return {
            x: (max.x + min.x) / 2,
            y: (max.y + min.y) / 2,
        }
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
        // px，py为p点的x和y坐标
        let p = pos
        let points = this.points.slice()
        let poly = points.map((p1, i) => [p1, points[(i + 1) % points.length]])
        let px = p.x,
            py = p.y,
            flag = false
        //这个for循环是为了遍历多边形的每一个线段
        for (let i = 0, l = poly.length; i < l; i++) {
            let sx = poly[i][0].x,  //线段起点x坐标
                sy = poly[i][0].y,  //线段起点y坐标
                tx = poly[i][1].x,  //线段终点x坐标
                ty = poly[i][1].y   //线段终点y坐标
            // 点与多边形顶点重合
            if ((sx === px && sy === py) || (tx === px && ty === py)) {
                return true
            }

            // 点的射线和多边形的一条边重合，并且点在边上
            if ((sy === ty && sy === py) && ((sx > px && tx < px) || (sx < px && tx > px))) {
                return true
            }

            // 判断线段两端点是否在射线两侧
            if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
                // 求射线和线段的交点x坐标，交点y坐标当然是py
                let x = sx + (py - sy) * (tx - sx) / (ty - sy)

                // 点在多边形的边上
                if (x === px) {
                    return true
                }

                // x大于px来保证射线是朝右的，往一个方向射，假如射线穿过多边形的边界，flag取反一下
                if (x > px) {
                    flag = !flag
                }
            }
        }

        // 射线穿过多边形边界的次数为奇数时点在多边形内
        if (flag) {
            return true
        } else {
            return false
        }
    }
}