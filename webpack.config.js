const path = require('path');
const fs = require('fs');

const srcFolder = path.join(__dirname, 'src');
const components = fs.readdirSync(srcFolder);

const files = [];
const entries = {};
components.forEach(component => {
  const name = component.split('.')[0];
  const file = `./src/${name}`;
  files.push(file);
  entries[name] = file;
});

module.exports = {
  entry: entries,
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'lib/'),
    libraryTarget: 'commonjs2',
  },
  externals(context, request, callback) {
    // Do not treat icon files as external
    if (files.indexOf(request) > -1) {
      return callback(null, false);
    }
    // Treat all other files as external
    return callback(null, true);
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'src'),
        query: {
          presets: ['env', 'stage-0'],
          plugins: [
            require('babel-plugin-transform-class-properties'),
            require('babel-plugin-transform-object-rest-spread'),
            require('babel-plugin-transform-object-assign'),
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
  },
};
