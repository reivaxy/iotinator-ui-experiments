const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const DynamicCdnWebpackPlugin = require('dynamic-cdn-webpack-plugin')

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = (env, options) => {
  const devMode = options.mode === 'development'
  const sourcemap = devMode ? 'cheap-module-source-map' : undefined
  const optionalPlugins = []
  if (devMode) {
    optionalPlugins.push(new webpack.HotModuleReplacementPlugin())
  } else {
    // Only in production. For dev, do not use CDN to be able to code without network.
    // Make sure that the following packages are downloaded from CDN (not part of the core bundle)
    // optionalPlugins.push(
    optionalPlugins.push(
      new DynamicCdnWebpackPlugin({
        only: ['react', 'react-dom', 'mobx'], // ## 'mobx-react' is not available yet… See https://github.com/mastilver/module-to-cdn/blob/master/modules.json
        verbose: true // Set it to true to see if cdn is used
      })
    )
  }

  return {
    entry: { main: './src/index.js' },
    devtool: sourcemap,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[hash].js'
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: sourcemap !== undefined
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    resolve: {
      // Avoid the need to specify extension when importing local modules
      extensions: ['.js', '.jsx', '.json']
    },
    devServer: {
      // Enable hot module reload. Without, dynamic loaded modules are not refreshed
      hot: true
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.jsx?$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        },

        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },

        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        // Package images
        {
          test: /\.(png|jpeg|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'images/[name].[hash].[ext]',
                publicPath: '../'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // Clean output directory
      new CleanWebpackPlugin('dist', {}),
      // Minimize CSS
      new MiniCssExtractPlugin({
        // Using contenthash for long term caching
        filename: devMode ? '[name].css' : '[contenthash].css',
        chunkFilename: devMode ? '[name][id].css' : '[name][id].[hash].css'
      }),
      // Generate index.html from template (auto-ref on new generated JS and css hashes)
      new HtmlWebpackPlugin({
        inject: true,
        hash: true,
        template: './src/index.template.html',
        filename: 'index.html'
      }),
      // ??
      new WebpackMd5Hash(),
      ...optionalPlugins
    ]
  }
}
