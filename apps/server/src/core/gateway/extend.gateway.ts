/*
 * @Author: Innei
 * @Date: 2020-05-06 11:57:22
 * @LastEditTime: 2020-08-03 10:53:02
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/gateway/extend.gateway.ts
 * @Coding with Love
 */
import { IoAdapter } from '@nestjs/platform-socket.io'
import type { Server } from 'socket.io'

export class ExtendsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options) as Server

    return server
  }
}
