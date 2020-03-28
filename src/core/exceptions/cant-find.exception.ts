import { UnprocessableEntityException } from '@nestjs/common'

export class CannotFindException extends UnprocessableEntityException {
  constructor() {
    super('真不巧, 内容走丢了 o(╥﹏╥)o')
  }
}
