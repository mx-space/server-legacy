set -e
yarn 
yarn build
yarn add @zeit/ncc
yarn run ncc build dist/main.js -o release
cp .env.example release/.env
zip -r release.zip release/* release/.env
