import { prop } from '@typegoose/typegoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'
import { BaseModel } from '@libs/db/models/base.model'

export class Say extends BaseModel {
  @prop({ required: true })
  @ApiProperty()
  @IsString()
  text: string

  @prop()
  @IsString()
  @IsOptional()
  source: string

  @prop()
  @IsString()
  @IsOptional()
  author: string
}
