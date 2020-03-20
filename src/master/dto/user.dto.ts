import { ApiProperty } from '@nestjs/swagger'

export class UserDto {
  @ApiProperty()
  readonly username: string

  @ApiProperty()
  readonly mail: string
  @ApiProperty()
  readonly password: string
  @ApiProperty()
  readonly name?: string
}
