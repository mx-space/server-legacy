import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsInt,
  IsDefined,
} from 'class-validator'

export enum Mood {
  'happy' = '开心',
  'sad' = '伤心',
  // // TODO:  <25-03-20, Innei> //
}

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
  @ApiProperty({ required: false })
  @IsString()
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
