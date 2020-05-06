import { IoAdapter } from '@nestjs/platform-socket.io'
import { gatewayAuthMiddleware } from '../middlewares/gateway-auth.middleware'
import type { Server } from 'socket.io'

export class ExtendsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options) as Server
    server.use(gatewayAuthMiddleware)
    return server
  }
}
