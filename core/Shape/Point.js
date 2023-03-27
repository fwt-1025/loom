import Shape from "./Shape.js";

export default class Point extends Shape {
    constructor(ctx, shapeProps) {
        super(ctx, shapeProps);
        this.type = "point";
    }
    getControlPoints() {
        return this.points
    }
    initPoints(ms) {
        this.points.push(ms);
    }
    drawGraph() {
        let matrix = this.ctx.getTransform();
        let ctx = this.ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath();
        ctx.arc(
            this.points[0].x * matrix.a + matrix.e,
            this.points[0].y * matrix.a + matrix.f,
            5,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = this.lineColor
        ctx.fill();
        ctx.closePath()
        ctx.restore();
        this.activating && this.drawControls()
    }
    drawControls() {
        let matrix = this.ctx.getTransform();
        let ctx = this.ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath();
        ctx.arc(
            this.points[0].x * matrix.a + matrix.e,
            this.points[0].y * matrix.a + matrix.f,
            10,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = this.lineColor
        ctx.stroke();
        ctx.closePath()
        ctx.restore();
    }
    isPointInPath(pos) {
        let { x, y } = this.points[0];
        if (x - 5 < pos.x && pos.x < x + 5 && pos.y < y + 5 && pos.y > y - 5) {
            return true;
        } else {
            return false
        }
    }
}
