// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true,
    inlineDynamicImports: true
  },
  onwarn(warning, warn) {
    // Suppress circular dependency warnings from node_modules
    if (
      warning.code === 'CIRCULAR_DEPENDENCY' &&
      warning.ids?.some(id => id.includes('node_modules'))
    ) {
      return
    }
    warn(warning)
  },
  plugins: [
    typescript(),
    nodeResolve({ 
      exportConditions: ['node', 'default'],
      browser: false,
      preferBuiltins: true 
    }),
    commonjs()
  ]
}

export default config