/*
 * @Author: Innei
 * @Date: 2020-04-30 18:14:55
 * @LastEditTime: 2020-05-25 21:05:26
 * @LastEditors: Innei
 * @FilePath: /mx-server/ecosystem.config.js
 * @Copyright
 */

const env = require('dotenv').config().parsed
module.exports = {
  apps: [
    {
      name: 'mx-space-server',
      script: 'dist/apps/server/main.js',
      autorestart: true,
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      // instances: 1,
      // max_memory_restart: env.APP_MAX_MEMORY || '150M',
      env: {
        NODE_ENV: 'production',
        ...env,
      },
    },
    {
      name: 'mx-space-graphql',
      script: 'dist/apps/graphql/main.js',
      autorestart: true,
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      // instances: 1,
      // max_memory_restart: env.APP_MAX_MEMORY || '150M',
      env: {
        NODE_ENV: 'production',
        ...env,
      },
    },
  ],
}
