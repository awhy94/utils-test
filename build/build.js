const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const buble = require('rollup-plugin-buble');
const flow = require('rollup-plugin-flow-no-whitespace');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

const config = {
  input: path.resolve(__dirname, '../src/index.js'),
  output: {
    file: path.resolve(__dirname, '../dist/esm.js'),
    name: 'utils-test',
    format: 'es',
  },
  plugins: [
    flow(),
    buble(),
    resolve(),
    babel({
      exclude: 'node_modules/**',
    })
  ],
  onwarn: (msg, warn) => {
    if (!/Circular/.test(msg)) {
      warn(msg)
    }
  }
};

buildEntry(config);

function buildEntry(config) {
  return rollup.rollup(config)
    .then(bundle => bundle.generate(config.output))
    .then(({output}) => {
      const code = output[0].code;
      return write(config.output.file, code)
    })
}

function write(file, code) {
  fs.writeFile(file, code, err => {
    if (err) return reject(err)
  })
}
