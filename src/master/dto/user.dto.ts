import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsEmail,
  IsUrl,
  IsOptional,
  IsNotEmpty,
} from 'class-validator'
export class UserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly username: string

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  readonly password: string

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  readonly mail?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  readonly name?: string

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  readonly url?: string

  // @ApiProperty()
  // readonly
}
