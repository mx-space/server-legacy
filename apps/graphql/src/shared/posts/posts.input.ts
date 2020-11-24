import { ArgsType, Field } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

@ArgsType()
export class SlugTitleInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  category: string

  @IsString()
  @IsNotEmpty()
  @Field()
  slug: string
}
