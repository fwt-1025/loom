/**
 * event listener
 */
export default class Event {
    constructor() {
        this.events = {}
    }
    on(eventName, listener) {
        let fns = this.events[eventName]
        if (Array.isArray(fns)) {
            fns.push(listener)
        } else {
            this.events[eventName] = [listener]
        }
    }
    emit(eventName, ...rest) {
        let fns = this.events[eventName]
        fns.forEach(item => {
            item.call(null, ...rest)
        })
    }
    off(eventName, listener) {
        let fns = this.events[eventName]
        let index = fns.findIndex(item => item === listener)
        fns.splice(index, 1)
    }
}