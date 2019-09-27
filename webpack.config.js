const path = require('path');

module.exports = {
  entry: './scripts/clientscripts/bullshit-bingo.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bullshit-bingo.js',
    path: path.resolve(__dirname, 'public/js/'),
  },
};