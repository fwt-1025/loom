export const getRandomId = () => {
    let str = 'abcdefg12334567890'
    let id = ''
    for(let i = 0; i < 8; i++) {
        let index = Math.floor(Math.random() * str.length)
        id += str[index]
    }
    return id
}