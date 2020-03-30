import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * 区分游客和主人的守卫
 */

declare interface Request {
  [name: string]: any
}
@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    let isMaster = false
    if (request.headers['authorization']) {
      try {
        isMaster = (await super.canActivate(context)) as boolean
      } catch {}
    }
    request.isGuest = !isMaster
    request.isMaster = isMaster
    return true
  }
}
