import { Module } from '@nestjs/common'
import { UploadsService } from './uploads.service'
import { ImageService } from './image.service'
import { UploadsController } from './uploads.controller'

@Module({
  providers: [UploadsService, ImageService],
  controllers: [UploadsController],
  exports: [ImageService],
})
export class UploadsModule {}
