#!sh
set -e
git pull
yarn
yarn build
pm2 stop ./ecosystem.config.js
yarn prod:pm2

