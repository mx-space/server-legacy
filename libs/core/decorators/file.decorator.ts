/*
 * @Author: Innei
 * @Date: 2020-07-31 20:19:21
 * @LastEditTime: 2020-07-31 20:25:38
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/decorators/file.decorator.ts
 * @Coding with Love
 */

import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiConsumes } from '@nestjs/swagger'
import { FileUploadDto } from '../dtos/file.dto'

export declare interface FileDecoratorProps {
  description: string
}
export function ApplyUpload({ description }: FileDecoratorProps) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description,
      type: FileUploadDto,
    }),
  )
}
