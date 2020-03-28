import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  IsNumber,
} from 'class-validator'

export enum Mood {
  'happy' = '开心',
  'sad' = '伤心',
  // // TODO:  <25-03-20, Innei> //
}

export class NoteDto {
  @ApiProperty({ example: 'This is title' })
  @IsString()
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
