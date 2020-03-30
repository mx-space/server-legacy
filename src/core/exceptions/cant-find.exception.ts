import { UnprocessableEntityException } from '@nestjs/common'
import { PickOne } from 'src/shared/utils'

export const NotFoundMessage = [
  '真不巧, 内容走丢了 o(╥﹏╥)o',
  '电波无法到达 ωω',
  '数据..不小心丢失了啦 π_π',
  '这也不是我的错啦 (๐•̆ ·̭ •̆๐)',
]

export class CannotFindException extends UnprocessableEntityException {
  constructor() {
    super(PickOne(NotFoundMessage))
  }
}
