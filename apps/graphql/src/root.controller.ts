/*
 * @Author: Innei
 * @Date: 2021-01-15 13:44:56
 * @LastEditTime: 2021-01-15 13:47:37
 * @LastEditors: Innei
 * @FilePath: /server/apps/graphql/src/root.controller.ts
 * @Mark: Coding with Love
 */
import { Controller, Get } from '@nestjs/common'

@Controller()
export class RootController {
  @Get('ping')
  getHello(): string {
    return 'pong'
  }
}
