import { IsNotEmpty, IsString } from 'class-validator'

export class RecentlyDto {
  @IsString()
  @IsNotEmpty()
  content: string
}
