# Mix Space Server

MiX Space, (Mx-space), 混合空间，又作梦想空间(MX 梦想)。这是后端部分。正在开发中。又前身代号 Focus 重写而来。（Focus 项目废止）

## 技术栈

- NestJS
- MongoDB
- Typegoose
- WebSocket

## 项目结构

```
├── README.md
├── libs                              // 通用库
│   └── db                            // 数据库相关
│       ├── src
│       │   ├── db.module.ts          // 数据库模块
│       │   ├── db.service.spec.ts
│       │   ├── db.service.ts
│       │   ├── index.ts
│       │   └── models                // 数据库模型
│       │       ├── base.model.ts     // 通用模型
│       │       ├── category.model.ts // 分类模型
│       │       ├── comment.model.ts  // 评论模型
│       │       ├── menu.model.ts     // 菜单模型
│       │       ├── note.model.ts     // 日记模型
│       │       ├── option.model.ts   // 设置相关
│       │       ├── page.model.ts     // 独立页面模型
│       │       ├── post.model.ts     // 文章模型
│       │       └── user.model.ts     // 用户模型
│       └── tsconfig.lib.json
├── migration.md                      // api 迁移文档
├── nest-cli.json
├── package.json
├── src                               // 主程序代码相关
│   ├── app.controller.ts             // 根控制器
│   ├── app.module.ts                 // 根模块
│   ├── app.service.ts                // 根服务
│   ├── auth                          // 认证模块
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   ├── auth.service.ts           // 认证通用业务逻辑
│   │   ├── interfaces                // 接口
│   │   │   └── jwt-payload.interface.ts
│   │   ├── jwt.strategy.ts           // jwt 认证钩子
│   │   ├── local.strategy.ts         // 密码认证钩子
│   │   └── roles.guard.ts            // 角色守卫
│   ├── core                          // 核心组件
│   │   ├── decorators                // 装饰器
│   │   │   ├── current-user.decorator.ts
│   │   │   └── guest.decorator.ts
│   │   ├── exceptions                // 自定义异常
│   │   │   └── cant-find.exception.ts
│   │   ├── filters                   // 过滤器
│   │   │   └── any-exception.filter.ts
│   │   └── interceptors              // 拦截器
│   │       ├── permission.interceptors.ts
│   │       └── response.interceptors.ts
│   ├── main.ts                       // 主入口
│   ├── master                        // 用户模块
│   │   ├── dto                       // dto 模型
│   │   │   └── user.dto.ts
│   │   ├── master.controller.ts
│   │   ├── master.e2e-spec.ts
│   │   ├── master.module.ts
│   │   └── master.service.ts
│   └── shared                        // 业务逻辑
│       ├── base                      // 通用业务逻辑
│       │   ├── base.service.spec.ts
│       │   ├── base.service.ts       // 通用 crud
│       │   ├── dto
│       │   │   └── id.dto.ts
│       │   └── interfaces
│       │       └── index.ts
│       ├── notes                     // 日记模块
│       │   ├── dto
│       │   │   └── note.dto.ts
│       │   ├── notes.controller.spec.ts
│       │   ├── notes.controller.ts
│       │   ├── notes.service.spec.ts
│       │   └── notes.service.ts
│       ├── posts                     // 文章模块
│       │   ├── dto
│       │   │   └── index.ts
│       │   ├── posts.controller.spec.ts
│       │   ├── posts.controller.ts
│       │   ├── posts.module.ts
│       │   ├── posts.service.spec.ts
│       │   └── posts.service.ts
│       ├── shared.module.ts
│       ├── shared.service.spec.ts
│       ├── shared.service.ts
│       └── utils                     // 扩展
│           └── index.ts
├── test
│   └── jest-e2e.json
├── tsconfig.build.json
├── tsconfig.json
├── webpack-hmr.config.js
└── yarn.lock

```
