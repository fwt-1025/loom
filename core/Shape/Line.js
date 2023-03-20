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