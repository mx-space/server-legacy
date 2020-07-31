import { ApiProperty } from '@nestjs/swagger'

/*
 * @Author: Innei
 * @Date: 2020-07-31 20:22:01
 * @LastEditTime: 2020-07-31 20:22:01
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/dtos/file.dto.ts
 * @Coding with Love
 */
export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any
}
