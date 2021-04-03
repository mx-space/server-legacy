import { Recently } from '@libs/db/models/recently.model'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class RecentlyDto implements Recently {
  @IsString()
  @IsNotEmpty()
  content: string
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  project?: string
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  language?: string
}
