import { IsOptional, IsEnum } from 'class-validator'
import { FileType } from '@libs/db/models/file.model'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class FileTypeQueryDto {
  @Transform((val) => Number(val))
  @IsOptional()
  @IsEnum(FileType)
  @ApiProperty({ enum: Object.keys(FileType) })
  type?: FileType
}
