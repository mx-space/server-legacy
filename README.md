# Mix Space Server

[![DeepScan grade](https://deepscan.io/api/teams/7938/projects/10675/branches/150239/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=7938&pid=10675&bid=150239)
[![time tracker](https://wakatime.com/badge/github/mx-space/server.svg)](https://wakatime.com/badge/github/mx-space/server)

## 技术栈

- NestJS
- MongoDB
- Typegoose
- WebSocket (Socket.IO)
- Redis

## 准备部署

开始之前，你需要一台搭载 Ubuntu 18.04 的服务器以更快的构建程序。因为这里已经提供了适用于 Ubuntu 18.04 构建的打包后的应用。

你只需要下载它：

```
wget -O mx-server.zip $(curl --silent "https://api.github.com/repos/mx-space/server/releases/latest" |
grep '"tag_name":' |
sed -E 's/.*"([^"]+)".*/https:\/\/github\.com\/mx-space\/server\/releases\/download\/\1\/release_ubuntu_amd64.zip/')
mkdir -p mx-server
unzip mx-server.zip -d ./mx-server
cd ./mx-server
mv release/* .
mv release/.* .
rmdir release

```

启动服务:

```
node index.js
```

## 注意

第一次使用会自动建立用户

密码为: master

可以进入后台管理之后自行修改.
