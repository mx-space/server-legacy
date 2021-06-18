import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { IsNilOrString } from 'utils/validator-decorators/isNilOrString'
import { PagerDto } from '../../base/dto/pager.dto'

export class NoteDto {
  @IsString()
  @Transform(({ value: title }) => (title.length === 0 ? '无题' : title))
  @IsOptional()
  title: string

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  text: string

  @IsOptional()
  @IsString()
  mood?: string

  @IsString()
  @IsOptional()
  weather?: string

  @IsOptional()
  @IsBoolean()
  hasMemory?: boolean = false

  @IsBoolean()
  @IsOptional()
  hide?: boolean = false

  @IsNilOrString()
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value: val }) => (String(val).length === 0 ? null : val))
  password?: string

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  secret?: Date

  @IsOptional()
  @IsNotEmptyObject()
  @Transform(({ value }) => undefined)
  options?: Record<string, unknown>

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => NoteMusicDto)
  music?: NoteMusicDto[]
}

export class NoteMusicDto {
  @IsString()
  @IsNotEmpty()
  type: string

  @IsString()
  @IsNotEmpty()
  id: string
}
export class ListQueryDto {
  @IsNumber()
  @Max(20)
  @Min(1)
  @Transform(({ value: v }) => parseInt(v))
  @IsOptional()
  @ApiProperty()
  size: number
}

export class NidType {
  @IsInt()
  @Min(1)
  @IsDefined()
  @ApiProperty()
  @Transform(({ value: val }) => parseInt(val))
  nid: number
}

export class PasswordQueryDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password?: string
}
export class NoteQueryDto extends PagerDto {
  @IsOptional()
  @IsEnum(['title', 'created', 'modified', 'weather', 'mood'])
  sortBy?: string

  @IsOptional()
  @IsEnum([1, -1])
  @ValidateIf((o) => o.sortBy)
  @Transform(({ value: v }) => v | 0)
  sortOrder?: 1 | -1
}
