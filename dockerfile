FROM node:12.13-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./
COPY dump.zip ./
RUN yarn config set registry https://registry.npm.taobao.org

RUN yarn
RUN rm -rf dump
RUN unzip dump.zip
COPY . .

EXPOSE 2333
CMD yarn start
