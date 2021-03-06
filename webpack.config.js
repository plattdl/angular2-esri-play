var path = require('path');
var webpack = require("webpack");
var minimize = process.argv.indexOf('--minimize') !== -1;

// Helper functions
function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}

config = {
  entry: {
    polyfills: './app/polyfills.ts',
    main: './app/main.ts',
    vendor: './app/vendor.ts'
  },
  output: {
    filename: './dist/[name].bundle.js',
    publicPath: './',
    libraryTarget: "amd"
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js', 'json']
  },
  module: {
    loaders: [
      // typescript
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      // css
      {
        test: /\.css$/,
        loaders: ["to-string-loader", "css-loader"]
      },
      // json
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      // html
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      // images
      {
        test: /\.(jpe?g|gif|png)$/,
        loader: 'file-loader?emitFile=false&name=[path][name].[ext]'
      }
    ]
  },
  plugins: [
    // https://github.com/angular/angular/issues/11580
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      root('./src') // location of your src
    ),

    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery'
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills'],
      minChunks: Infinity
    })
  ],
  externals: [
    function (context, request, callback) {
      if (/^dojo/.test(request) ||
        /^dojox/.test(request) ||
        /^dijit/.test(request) ||
        /^esri/.test(request)
      ) {
        return callback(null, "amd " + request);
      }
      callback();
    }
  ],
  devtool: 'source-map'
};

if (minimize) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    beautify: false, //prod
    output: {
      comments: false
    }, //prod
    mangle: {
      except: ['$', 'require'],
      screw_ie8: true,
      keep_fnames: true
    }, //prod
    compress: {
      screw_ie8: true,
      warnings: false,
      conditionals: true,
      unused: true,
      comparisons: true,
      sequences: true,
      dead_code: true,
      evaluate: true,
      if_return: true,
      join_vars: true,
      negate_iife: false // we need this for lazy v8
    }
  }));
  config.htmlLoader = {
    minimize: false // workaround for ng2
  }
}

module.exports = config;