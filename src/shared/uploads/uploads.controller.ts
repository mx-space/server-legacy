import {
  Controller,
  Post,
  Req,
  Res,
  BadRequestException,
  Param,
  Get,
} from '@nestjs/common'
import { ApiConsumes, ApiProperty, ApiBody, ApiTags } from '@nestjs/swagger'
import { UploadsService } from 'src/shared/uploads/uploads.service'
import { FastifyRequest, FastifyReply } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'
import { Auth } from 'src/core/decorators/auth.decorator'
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
  async uploadImage(@Req() req: FastifyRequest<IncomingMessage>) {
    if (!req.isMultipart()) {
      throw new BadRequestException('仅供上传文件!')
    }
    if (!req.body.file) {
      throw new BadRequestException('字段必须为 file')
    }
    const fileInfo = req.body.file[0]
    if (!fileInfo) {
      throw new BadRequestException('文件丢失了')
    }
    if (fileInfo.limit) {
      throw new BadRequestException('文件不符合, 大小不得超过 6M')
    }
    const data = await this.service.saveImage(fileInfo)
    return { ...data }
  }

  @Get(':hashname')
  async getImage(
    @Param('hashname') name: string,
    @Res() res: FastifyReply<ServerResponse>,
  ) {
    const { buffer, mime } = await this.service.checkFileExist(
      name,
      this.service.imagePath,
    )
    const stream = this.service.getReadableStream(buffer)
    res.type(mime).send(stream)
  }

  // TODO: 增加删除和获取信息的接口  <13-04-20 Innei> //
}
