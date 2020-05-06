import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ImportService } from './import.service'
import { DataListDto, ArticleType } from './dto/datatype.dto'

@Controller('import')
@ApiTags('Import Routes')
export class ImportController {
  constructor(private readonly service: ImportService) {}

  @Post()
  async importArticle(@Body() body: DataListDto) {
    const type = body.type

    switch (type) {
      case ArticleType.Post: {
        return await this.service.insertPostsToDb(body.data)
      }
      case ArticleType.Note: {
        return await this.service.insertNotesToDb(body.data)
      }
    }
  }
}
