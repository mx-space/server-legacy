set -e
###
# @Author: Innei
# @Date: 2020-09-17 14:04:22
# @LastEditTime: 2021-01-15 14:51:43
# @LastEditors: Innei
# @FilePath: /server/release.sh
# @Mark: Coding with Love
###
yarn
yarn build:server
yarn add @zeit/ncc
yarn run ncc build dist/apps/server/main.js -o release
cp .env.example release/.env
zip -r release.zip release/* release/.env
