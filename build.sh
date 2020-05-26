###
# @Author: Innei
# @Date: 2020-05-24 20:09:20
# @LastEditTime: 2020-05-25 21:06:15
# @LastEditors: Innei
# @FilePath: /mx-server/build.sh
# @Copyright
###
#!sh
set -e
git pull
yarn
yarn build
pm2 reload ./ecosystem.config.js
