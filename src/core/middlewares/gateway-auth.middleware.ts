export const gatewayAuthMiddleware = (
  socket: SocketIO.Socket,
  next: Function,
) => {
  const token = socket.handshake.query.token

  if (!token) {
    next(new Error('认证异常'))
  }
  // TODO token auth
  next()
}
