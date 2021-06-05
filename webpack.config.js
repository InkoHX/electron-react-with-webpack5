const path = require('path')
const electronReleases = require('electron-releases')
const electronVersion = require('electron/package.json').version
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlSriPlugin = require('webpack-subresource-integrity')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { node: electronNodeVersion, chrome: electronChromeVersion } =
  electronReleases.find(
    value =>
      value.npm_package_name === 'electron' &&
      value.npm_dist_tags.includes('latest') &&
      value.version === electronVersion
  ).deps

const electronMainBabelRule = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: electronNodeVersion,
            },
          },
        ],
      ],
    },
  },
}

const baseConfig = {
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.sass', '.scss'],
  },
  devtool: 'inline-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}

const main = {
  ...baseConfig,
  entry: {
    main: './src/app/main.js',
  },
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [electronMainBabelRule],
  },
}

const preload = {
  ...baseConfig,
  entry: {
    preload: './src/app/preload.js',
  },
  target: 'electron-preload',
  module: {
    rules: [electronMainBabelRule],
  },
}

const renderer = {
  ...baseConfig,
  target: ['web', 'es2020'],
  output: {
    ...baseConfig.output,
    crossOriginLoading: 'anonymous',
  },
  entry: {
    renderer: './src/renderer/renderer.jsx',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new HtmlSriPlugin({
      hashFuncNames: ['sha256', 'sha512'],
      enabled: true,
    }),
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              [
                '@babel/preset-env',
                {
                  targets: {
                    chrome: electronChromeVersion.split('.')[0],
                  },
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.s[ac]ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
}

module.exports = [main, preload, renderer]
