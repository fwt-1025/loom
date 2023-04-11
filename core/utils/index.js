export const warn = (msg) => {
    console.warn('Canvas-annotation Warn:' + msg)
}

export const error = (msg, err) => {
    if (err) console.error('Canvas-annotation Error:\r\n' + msg, err)
    else console.error('Canvas-annotation Error:' + msg)
}

export const isUnDef = (exp) => {
    return exp === undefined || exp === null
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