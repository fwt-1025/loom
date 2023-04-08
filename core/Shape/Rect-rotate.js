/**
 * 会旋转的矩形
 * 可以扩展为任意图形旋转，需要在图形最外面包裹一个盒子，然后旋转这个盒子，图形内的点跟着旋转即可。
 */
import Shape from "./Shape.js";

export default class RectRotate extends Shape {
    startPos = {
        x: null,
        y: null,
    };
    control_points = [];
    rotate_angle = 0;
    constructor(ctx, shapeProps) {
        super(ctx, shapeProps);
        this.type = "rectRotate";
        this.angle = shapeProps.angle || 0;
        this.rotate = true
    }
    initPoints(ms, me) {
        this.points[0] = {
            x: ms.x > me.x ? me.x : ms.x,
            y: ms.y > me.y ? me.y : ms.y,
        };
        this.points[1] = {
            x: me.x > ms.x ? me.x : ms.x,
            y: ms.y > me.y ? me.y : ms.y,
        };
        this.points[2] = {
            x: me.x > ms.x ? me.x : ms.x,
            y: me.y > ms.y ? me.y : ms.y,
        };
        this.points[3] = {
            x: ms.x > me.x ? me.x : ms.x,
            y: me.y > ms.y ? me.y : ms.y,
        };
        this.x = this.points[0].x;
        this.y = this.points[0].y;
        this.width = this.points[2].x - this.x;
        this.height = this.points[2].y - this.y;
        this.getShapeCenter();
    }
    getControlPoints() {
        this.control_points = [
            // p0,
            {
                x: this.centerPos.x - this.width / 2,
                y: this.centerPos.y - this.height / 2,
            },
            // {
            //     x: (p0.x + p1.x) / 2,
            //     y: p0.y,
            // },
            // p1,
            {
                x: this.centerPos.x + this.width / 2,
                y: this.centerPos.y - this.height / 2,
            },
            // {
            //     x: p1.x,
            //     y: (p2.y + p0.y) / 2
            // },
            // p2,
            {
                x: this.centerPos.x + this.width / 2,
                y: this.centerPos.y + this.height / 2,
            },
            // {
            //     x: (p0.x + p1.x) / 2,
            //     y: p2.y
            // },
            // p3,
            {
                x: this.centerPos.x - this.width / 2,
                y: this.centerPos.y + this.height / 2,
            },
            // {
            //     x: p0.x,
            //     y: (p0.y + p2.y) / 2
            // },
            {
                x: this.centerPos.x,
                y: this.centerPos.y - this.height / 2 - 20,
            },
        ];
        this.points = this.control_points = this.getRotatePoints(this.centerPos, this.angle);
        return this.control_points;
    }
    drawGraph() {
        if (this.points.length < 3) {
            this.initPoints(this.points[0], this.points[1]);
        }
        let mat = this.ctx.getTransform();
        this.getControlPoints();
        let ctx = this.ctx;
        ctx.save();
        ctx.setTransform(
            Math.cos(this.angle),
            Math.sin(this.angle),
            -Math.sin(this.angle),
            Math.cos(this.angle),
            this.centerPos.x * mat.a + mat.e,
            this.centerPos.y * mat.a + mat.f
        );
        ctx.beginPath();
        ctx.fillStyle = "#f00";
        ctx.arc(0, 0, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle = this.lineColor;
        let w = this.width * mat.a;
        let h = this.height * mat.a;
        ctx.rect(-w / 2, -h / 2, w, h);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        this.activating && this.drawControls();
    }
    drawControls() {
        let mat = this.ctx.getTransform();
        let ctx = this.ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.control_points.forEach((item, index) => {
            let x = item.x * mat.a + mat.e;
            let y = item.y * mat.a + mat.f;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        });
        ctx.restore();
    }
    getArea() {
        let { x, y } = this.points[0];
        let { x: x1, y: y1 } = this.points[1];
        return (x1 - x) * (y1 - y);
    }
    getMaxAndMinmun() {
        let maxX = Math.max.apply(
            null,
            this.points.map((item) => item.x)
        );
        let maxY = Math.max.apply(
            null,
            this.points.map((item) => item.y)
        );
        let minX = Math.min.apply(
            null,
            this.points.map((item) => item.x)
        );
        let minY = Math.min.apply(
            null,
            this.points.map((item) => item.y)
        );
        return {
            max: {
                x: maxX,
                y: maxY,
            },
            min: {
                x: minX,
                y: minY,
            },
        };
    }
    getShapeCenter() {
        let centerPos = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
        this.centerPos = centerPos;
        return centerPos;
    }
    updateGraph(index, pos, ms) {
        if (typeof ms === "object" && !this.startPos.x) {
            this.startPos = ms;
        }
        let relationship = {
            0: 2,
            1: 3,
            2: 0,
            3: 1,
        };
        switch (index) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.setPoints(pos, relationship[index]);
                break;
            //     this.points[1].x = x;
            //     break;
            // case 4:
            //     this.points[1] = pos;
            //     break;
            // case 5:
            //     this.points[1].y = y;
            //     break;
            // case 6:
            //     this.points[0].x = x;
            //     this.points[1].y = y;
            //     break;
            // case 7:
            //     this.points[0].x = x;
            //     break;
            case 4:
                let initAngle = Math.atan2(
                    this.startPos.y - this.centerPos.y,
                    this.startPos.x - this.centerPos.x
                );
                let currentAngle = Math.atan2(
                    pos.y - this.centerPos.y,
                    pos.x - this.centerPos.x
                );
                this.rotate_angle = currentAngle - initAngle;
                this.angle += this.rotate_angle
                this.startPos = pos;
                break;
        }
    }
    setPoints(pos, index) {
        this.centerPos = {
            x: (pos.x + this.control_points[index].x) / 2,
            y: (pos.y + this.control_points[index].y) / 2,
        };
        let originPos = {
            x:
                (pos.x - this.centerPos.x) * Math.cos(-this.angle) -
                (pos.y - this.centerPos.y) * Math.sin(-this.angle) +
                this.centerPos.x,
            y:
                (pos.x - this.centerPos.x) * Math.sin(-this.angle) +
                (pos.y - this.centerPos.y) * Math.cos(-this.angle) +
                this.centerPos.y,
        };
        let originPoints = this.getRotatePoints(this.centerPos, -this.angle)
        this.width = Math.abs(originPoints[index].x - originPos.x)
        this.height = Math.abs(originPoints[index].y - originPos.y)
    }
    getPoints() {
        this.points = [
            {
                x: this.x,
                y: this.y,
            },
            {
                x: this.x + this.width,
                y: this.y,
            },
            {
                x: this.x + this.width,
                y: this.y + this.height,
            },
            {
                x: this.x,
                y: this.height + this.y,
            },
        ];
    }
    getRotatePoints({ x, y }, angle) {
        let r_points = this.control_points.map((item) => {
            return {
                x:
                    (item.x - x) * Math.cos(angle) -
                    (item.y - y) * Math.sin(angle) +
                    x,
                y:
                    (item.x - x) * Math.sin(angle) +
                    (item.y - y) * Math.cos(angle) +
                    y,
            };
        });
        return r_points;
    }
    isPointInPath(pos) {
        // px，py为p点的x和y坐标
        let p = pos;
        let points = this.control_points.slice(0, 4);
        let poly = points
            .map((p1, i) => [p1, points[(i + 1) % points.length]])
            .slice(0, 7);
        let px = p.x,
            py = p.y,
            flag = false;
        //这个for循环是为了遍历多边形的每一个线段
        for (let i = 0, l = poly.length; i < l; i++) {
            let sx = poly[i][0].x, //线段起点x坐标
                sy = poly[i][0].y, //线段起点y坐标
                tx = poly[i][1].x, //线段终点x坐标
                ty = poly[i][1].y; //线段终点y坐标
            // 点与多边形顶点重合
            if ((sx === px && sy === py) || (tx === px && ty === py)) {
                return true;
            }

            // 点的射线和多边形的一条边重合，并且点在边上
            if (
                sy === ty &&
                sy === py &&
                ((sx > px && tx < px) || (sx < px && tx > px))
            ) {
                return true;
            }

            // 判断线段两端点是否在射线两侧
            if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
                // 求射线和线段的交点x坐标，交点y坐标当然是py
                let x = sx + ((py - sy) * (tx - sx)) / (ty - sy);

                // 点在多边形的边上
                if (x === px) {
                    return true;
                }

                // x大于px来保证射线是朝右的，往一个方向射，假如射线穿过多边形的边界，flag取反一下
                if (x > px) {
                    flag = !flag;
                }
            }
        }

        // 射线穿过多边形边界的次数为奇数时点在多边形内
        if (flag) {
            return true;
        } else {
            return false;
        }
    }
}
