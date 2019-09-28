const path = require('path');

module.exports = {
  entry: './scripts/clientscripts/bullshit-bingo.js',
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        include: path.resolve(__dirname, 'scripts/clientscripts'),
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
  mode: 'development',
};

// const path = require('path');

// module.exports = {
//   entry: './scripts/clientscripts',
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         exclude: /node_modules/,
//         use: {
//           loader: "babel-loader",
//           options: {
//             presets: ['@babel/preset-env']
//           }
//         }
//       },
//     ],
//   },
//   output: {
//     path: path.resolve(__dirname, 'public/js/'),
//     filename: 'bullshit-bingo.js',
//   },
//   mode: 'development',
// };