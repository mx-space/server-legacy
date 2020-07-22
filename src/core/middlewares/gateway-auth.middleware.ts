/*
 * @Author: Innei
 * @Date: 2020-05-21 11:05:42
 * @LastEditTime: 2020-07-22 16:32:05
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/middlewares/gateway-auth.middleware.ts
 * @Copyright
 */

export const gatewayAuthMiddleware = (
  socket: SocketIO.Socket,
  next: (err?: any) => void,
) => {
  const token = socket.handshake.query.token

  if (!token) {
    next(new Error('认证异常'))
  }

  next()
}
