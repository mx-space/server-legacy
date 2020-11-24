import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

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

export const GuestGQL = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = GqlExecutionContext.create(ctx).getContext().req
    return request.isGuest
  },
)

export const MasterGQL = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = GqlExecutionContext.create(ctx).getContext().req

    return request.isMaster
  },
)
