import type { Configuration } from 'webpack';

module.exports = {
  entry: { background: { import: 'src/background.ts', runtime: false } },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
} as Configuration;
