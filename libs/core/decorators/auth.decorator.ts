/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-07-31 20:05:08
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/decorators/auth.decorator.ts
 * @Coding with Love
 */

import { applyDecorators, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { isDev } from 'libs/utils'

export function Auth() {
  const decorators = []
  if (!isDev) {
    decorators.push(UseGuards(AuthGuard('jwt')))
  }
  decorators.push(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  )
  return applyDecorators(...decorators)
}
