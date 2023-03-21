export const warn = (msg) => {
    console.warn(msg)
}

export const error = (msg, err) => {
    if (err) console.error(msg, err)
    else console.error(msg)
}