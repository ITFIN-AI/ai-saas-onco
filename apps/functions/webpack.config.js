const { engines, name, version } = require('./package.json');

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// The cost of being fancy I suppose
// https://github.com/firebase/firebase-tools/issues/653

/**
 * A Webpack 5 plugin that can be passed a list of packages that are of type
 * ESM. The typescript compiler will then be instructed to use the `import`
 * external type.
 */
class ESMLoader {
  static defaultOptions = {
    esmPackages: 'all',
  };

  constructor(options = {}) {
    this.options = { ...ESMLoader.defaultOptions, ...options };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(
      'ECMAScript Module (ESM) Loader. Turns require() into import()',
      (compilation) => {
        compilation.hooks.buildModule.tap('Hello World Plugin', (module) => {
          if (
            module.type === 'javascript/dynamic' &&
            (this.options.esmPackages === 'all' ||
              this.options.esmPackages.includes(module.request))
          ) {
            // All types documented at
            // https://webpack.js.org/configuration/externals/#externalstype
            // module.externalType = 'import';
            module.request = '@babel/runtime/helpers/objectSpread2';
          }
        });
      }
    );
  }
}

const basePackage = {
  name,
  version,
  main: './index.js',
  scripts: {
    start: 'pnpm run shell',
  },
  engines,
  dependencies: {
    bir1: '^1.2.6',
  },
};

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules\/(?!@akademiasaas)/,
        options: {
          configFile: 'tsconfig.json',
          transpileOnly: true,
          compilerOptions: {
            declarationMap: false,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      shared: path.resolve(__dirname, 'src/shared'),
      config: path.resolve(__dirname, 'src/config'),
      modules: path.resolve(__dirname, 'src/modules'),
    },
    preferRelative: true, // Add this line
    symlinks: false,
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'commonjs',
    clean: true,
    hashFunction: 'xxhash64',
  },
  externals: [
    /^firebase.+$/,
    /^@google.+$/,
    /^bir.+$/,
    nodeExternals({
      allowlist: [/^@akademiasaas/],
    }),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules'),
      allowlist: [/^@akademiasaas/],
    }),
  ],
  plugins: [
    new GeneratePackageJsonPlugin(basePackage),
    new ESMLoader({ esmPackages: '@babel/runtime/helpers/esm/objectSpread2' }),
  ],
};
