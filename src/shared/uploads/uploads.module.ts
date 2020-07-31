/*
 * @Author: Innei
 * @Date: 2020-04-30 16:03:37
 * @LastEditTime: 2020-07-31 20:09:19
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/uploads/uploads.module.ts
 * @Coding with Love
 */

import { Module } from '@nestjs/common'
import { ImageService } from './image.service'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'

@Module({
  providers: [ImageService, UploadsService],
  controllers: [UploadsController],
  exports: [ImageService, UploadsService],
})
export class UploadsModule {}
