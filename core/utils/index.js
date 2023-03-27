export const warn = (msg) => {
    console.warn(msg)
}

export const error = (msg, err) => {
    if (err) console.error(msg, err)
    else console.error(msg)
}
let time = 0
export function debounce(fn, delay) {
    if (!time) {
        fn()
        time = Date.now()
    }
    if (Date.now() - time < delay) {
        return
    }
    fn()
    time = Date.now()
}