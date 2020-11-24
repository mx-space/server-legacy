import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Guest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.isGuest
  },
)

export const Master = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.isMaster
  },
)
