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
  name?: string

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  readonly url?: string

  // @ApiProperty()
  // readonly
}

export class LoginDto {
  @ApiProperty({ required: true })
  @IsString()
  username: string

  @ApiProperty({ required: true })
  @IsString()
  password: string
}
