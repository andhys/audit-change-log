const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'AuditChangeLog',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react', '@babel/preset-typescript']
            }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM'
    },
    '@mui/material': {
      commonjs: '@mui/material',
      commonjs2: '@mui/material',
      amd: '@mui/material',
      root: 'MaterialUI'
    },
    '@emotion/react': {
      commonjs: '@emotion/react',
      commonjs2: '@emotion/react',
      amd: '@emotion/react',
      root: 'emotionReact'
    },
    '@emotion/styled': {
      commonjs: '@emotion/styled',
      commonjs2: '@emotion/styled',
      amd: '@emotion/styled',
      root: 'emotionStyled'
    }
  }
};
