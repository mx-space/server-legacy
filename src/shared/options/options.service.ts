/*
 * @Author: Innei
 * @Date: 2020-05-08 20:01:58
 * @LastEditTime: 2020-08-24 22:07:29
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/options/options.service.ts
 * @Coding with Love
 */

import {
  Injectable,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { ClassType } from 'class-transformer/ClassTransformer'
import { validate } from 'class-validator'
import {
  BackupOptions,
  BaiduSearchOptions,
  CommentOptions,
  ImageBedDto,
  MailOptionsDto,
  SEODto,
  UrlDto,
} from '../../configs/configs.dto'
import { ConfigsService, IConfig } from '../../configs/configs.service'

@Injectable()
export class OptionsService {
  constructor(
    // @InjectModel(Option)
    // private readonly optionModel: ReturnModelType<typeof Option>,
    // @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    // @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
    // @InjectModel(Note) private readonly nodeModel: ReturnModelType<typeof Note>,
    private readonly configs: ConfigsService,
  ) {}

  validOptions = {
    whitelist: true,
  }
  validate = new ValidationPipe(this.validOptions)
  async patchAndValid(key: keyof IConfig, value: any) {
    switch (key) {
      case 'url': {
        await this.validWithDto(UrlDto, value)
        return this.configs.patch('url', value)
      }
      case 'commentOptions': {
        await this.validWithDto(CommentOptions, value)
        return this.configs.patch('commentOptions', value)
      }
      case 'imageBed': {
        await this.validWithDto(ImageBedDto, value)
        return this.configs.patch('imageBed', value)
      }
      case 'mailOptions': {
        await this.validWithDto(MailOptionsDto, value)
        return this.configs.patch('mailOptions', value)
      }
      case 'seo': {
        await this.validWithDto(SEODto, value)
        return this.configs.patch('seo', value)
      }
      case 'backupOptions': {
        await this.validWithDto(BackupOptions, value)
        return this.configs.patch('backupOptions', value)
      }
      case 'baiduSearchOptions': {
        await this.validWithDto(BaiduSearchOptions, value)

        return this.configs.patch('baiduSearchOptions', value)
      }
      default: {
        throw new UnprocessableEntityException('设置不存在')
      }
    }
  }

  private async validWithDto<T>(dto: ClassType<T>, value: any) {
    const validModel = plainToClass(dto, value)
    const errors = await validate(validModel, this.validOptions)
    if (errors.length > 0) {
      const error = this.validate.createExceptionFactory()(errors as any[])
      throw error
    }
    return true
  }
}
