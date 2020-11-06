import { MoodSet, WeatherSet } from '@libs/db/models/note.model'
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

export const Mood = Object.keys(MoodSet)
export const Weather = Object.keys(WeatherSet)
export class NoteDto {
  @ApiProperty({ example: 'This is title' })
  @IsString()
  @Transform((title: string) => (title.length === 0 ? '无题' : title))
  title: string
  @ApiProperty({ example: 'This is body' })
  @IsString()
  text: string
  @ApiProperty({ enum: Mood })
  @IsOptional()
  @IsEnum(Mood)
  mood?: string
  @ApiProperty({ required: false, enum: Weather })
  @IsEnum(Weather)
  @IsOptional()
  weather?: string
  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  hide?: boolean
  @ApiProperty()
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
