import Shape from './Shape.js'

export default class Point extends Shape{
    constructor(ctx, shapeProps) {
        super(ctx, shapeProps)
        this.type = 'point'
    }
    getControlPoints() {
        return this.points
    }
    initPoints() {
    }
    drawGraph() {
    }
    drawControls() {
    }
    isPointInPath() {
    }
}