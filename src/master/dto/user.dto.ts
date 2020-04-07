import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
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

  @ApiProperty({ required: false, example: 'example@example.com' })
  @IsEmail()
  @IsOptional()
  readonly mail?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ required: false, example: 'example.com' })
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

export class UserPatchDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly username: string

  @IsString()
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  readonly password: string

  @ApiProperty({ required: false, example: 'example@example.com' })
  @IsEmail()
  @IsOptional()
  readonly mail?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ required: false, example: 'example.com' })
  @IsUrl()
  @IsOptional()
  readonly url?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  apiToken: string[]
}
