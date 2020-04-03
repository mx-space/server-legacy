const path = require('path')
const webpack = require('webpack')
module.exports = {
  entry: './src/main.ts',
  target: 'node',
  mode: 'none',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          // ADD THIS
          '@nestjs/microservices/microservices-module',
          '@nestjs/websockets',
          // AND THIS
          '@nestjs/websockets/socket-module',
          '@nestjs/platform-express',
          'cache-manager',
          'class-validator',
          'class-transformer',
          'swagger-ui-express',
          'point-of-view',
          'aws-sdk',
        ]

        if (!lazyImports.includes(resource)) {
          return false
        }
        try {
          require.resolve(resource)
        } catch (err) {
          return true
        }
        return false
      },
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      src: path.resolve(__dirname, './src'),
      '@libs/db': path.resolve(__dirname, './libs/db/src'),
    },
  },
}
