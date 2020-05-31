import { Module } from '@nestjs/common'
import { ImageService } from './image.service'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'

@Module({
  providers: [ImageService, UploadsService],
  controllers: [UploadsController],
  exports: [ImageService],
})
export class UploadsModule {}
