import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator'

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
