import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PagerDto } from 'src/shared/base/dto/pager.dto'

export class SearchDto extends PagerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  keyword: string

  @IsString()
  @ApiProperty({ description: '根据什么排序', required: false })
  @IsNotEmpty()
  @IsOptional()
  orderBy: string

  @Transform((val) => parseInt(val))
  @IsEnum([1, -1])
  @IsOptional()
  @ApiProperty({ description: '倒序|正序', enum: [1, -1], required: false })
  order: number
}
