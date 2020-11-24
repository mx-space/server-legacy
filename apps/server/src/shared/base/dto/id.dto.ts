import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class IdDto {
  @IsMongoId()
  @ApiProperty({
    name: 'id',
    // enum: ['5e6f67e75b303781d2807279', '5e6f67e75b303781d280727f'],
    example: '5e6f67e75b303781d2807278',
  })
  id: string
}
