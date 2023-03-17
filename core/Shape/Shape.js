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
        control
    }) {
        super()
        this.ctx = ctx
        this.points = points || []
        this.control = control || true
        this.controlPoints = []
        this.lineColor = lineColor || '#f00'
        this.fillColor = fillColor || '#f00'
        this.lineWidth = lineWidth || 3
        this.creating = false
        this.editing = false
        this.activating = false
        this.uuid = Math.random()
    }
}