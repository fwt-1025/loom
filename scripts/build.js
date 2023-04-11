const terser = require('@rollup/plugin-terser')
const babel = require('@rollup/plugin-babel')
const rollup = require('rollup')

let inputConfig = {
    input: './index.js',
    plugins: [
        babel()
    ]
}

let outputConfig = {
    'umd': {
        file: './dist/canvas-annotation.umd.js',
        format: 'umd',
        name: 'Canvas'
    },
    'es': {
        file: './dist/canvas-annotation.esm.js',
        format: 'es',
    },
    'cjs': {
        file: './dist/canvas-annotation.cjs.js',
        format: 'cjs',
    }
}

let target = process.argv.filter(item => {
    return item.indexOf('TARGET') > -1
})
target = target[0].split(':')[1]

async function build() {
    let bundle = await rollup.rollup(inputConfig)
    let outputOptions = Object.assign(outputConfig[target], {
        plugins: [
            terser()
        ]
    })
    // const { output } = await bundle.generate(outputOptions)
    await bundle.write(outputOptions)
}
build()