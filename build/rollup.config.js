const babel = require('rollup-plugin-babel');

export default [{
  input: 'src/index.js',
  output: [{
    file: 'dist/index-es.js',
    format: 'es',
  }, {
    file: 'dist/index-umd.js',
    name: 'utils-test',
    format: 'umd',
  }],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    })
  ]
}];