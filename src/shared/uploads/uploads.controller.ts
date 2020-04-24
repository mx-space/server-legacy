import { FileType, getEnumFromType } from '@libs/db/models/file.model'
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger'
import { FastifyReply, FastifyRequest } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'
import { Auth } from 'src/core/decorators/auth.decorator'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { UploadsService } from 'src/shared/uploads/uploads.service'
import { IdDto } from '../base/dto/id.dto'
import { FileTypeQueryDto } from './dto/filetype.dto'
class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any
}

@Controller('uploads')
@ApiTags('File Routes')
export class UploadsController {
  constructor(private readonly service: UploadsService) {}

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload images',
    type: FileUploadDto,
  })
  // @Auth()
  async uploadImage(
    @Req() req: FastifyRequest<IncomingMessage>,
    @Query() query: FileTypeQueryDto,
  ) {
    const { type = FileType.IMAGE } = query
    const fileInfo = this.service.ValidImage(req)
    const data = await this.service.saveImage(fileInfo, type)
    return { ...data }
  }

  @Get(':type/:hashname')
  async getImage(
    @Param('hashname') name: string,
    @Param('type') _type: string,
    @Res() res: FastifyReply<ServerResponse>,
  ) {
    const type = getEnumFromType(_type.toUpperCase() as keyof typeof FileType)
    if (!(type in FileType)) {
      throw new CannotFindException()
    }

    const { buffer, mime } = await this.service.checkFileExist(name, type)
    const stream = this.service.getReadableStream(buffer)
    res.type(mime).send(stream)
  }

  @Get('image/info/:hashname')
  async getImageInfo(
    @Param('hashname') name: string,
    @Query() query: FileTypeQueryDto,
  ) {
    const { type = FileType.IMAGE } = query
    return await this.service.getImageInfo(name, type)
  }
  @Delete(':id')
  async deleteFile(@Param() param: IdDto) {
    const { id } = param
    return this.service.deleteFile(id)
  }
}
