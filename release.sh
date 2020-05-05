yarn 
yarn build
yarn add @zeit/ncc
yarn run ncc build dist/main.js -o release
zip -r release.zip release/*
