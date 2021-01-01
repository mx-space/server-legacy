import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
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
import { PagerDto } from '../../base/dto/pager.dto'

export class NoteDto {
  @IsString()
  @Transform((title: string) => (title.length === 0 ? '无题' : title))
  title: string

  @IsString()
  text: string

  @IsOptional()
  @IsString()
  mood?: string

  @IsString()
  @IsOptional()
  weather?: string

  @IsOptional()
  @IsBoolean()
  hasMemory?: boolean

  @IsBoolean()
  @IsOptional()
  hide?: boolean

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Transform((password) => (String(password).length === 0 ? null : password))
  password?: string
  @IsOptional()
  @IsNotEmptyObject()
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
  @Transform((number) => parseInt(number))
  @IsOptional()
  @ApiProperty()
  size: number
}

export class NidType {
  @IsInt()
  @Min(1)
  @IsDefined()
  @ApiProperty()
  @Transform((val) => parseInt(val))
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
  @Transform((v) => ~~v)
  sortOrder?: 1 | -1
}
