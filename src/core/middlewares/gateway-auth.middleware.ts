/*
 * @Author: Innei
 * @Date: 2020-05-21 11:05:42
 * @LastEditTime: 2020-05-26 09:23:52
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
  // TODO token auth
  next()
}
