const terser = require('@rollup/plugin-terser')
const babel = require('@rollup/plugin-babel')
module.exports = {
    input: './index.js',
    output: {
        file: './dist/canvas-annotation.js',
        format: 'umd',
        name: 'Canvas'
    },
    plugins: [
        babel(),
        terser()
    ]
}