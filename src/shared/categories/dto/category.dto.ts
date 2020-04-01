import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum CategoryType {
  Category = 'Category',
  Tag = 'Tag',
}

export class CategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsEnum(CategoryType)
  @IsOptional()
  @ApiProperty({ required: false })
  type?: CategoryType

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ required: false })
  slug?: string
}

export class SlugOrIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  query?: string
}
