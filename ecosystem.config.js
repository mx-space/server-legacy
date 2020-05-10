const env = require('dotenv').config().parsed
module.exports = {
  apps: [
    {
      name: 'MxSpace-server',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: env.APP_MAX_MEMORY || '150M',
      env: {
        NODE_ENV: 'production',
        ...env,
      },
    },
  ],
}
