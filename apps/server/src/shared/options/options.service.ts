/*
 * @Author: Innei
 * @Date: 2020-05-08 20:01:58
 * @LastEditTime: 2021-01-15 14:12:43
 * @LastEditors: Innei
 * @FilePath: /server/apps/server/src/shared/options/options.service.ts
 * @Coding with Love
 */

import {
  Injectable,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common'
import { ClassConstructor, plainToClass } from 'class-transformer'
import { validateSync, ValidatorOptions } from 'class-validator'
import {
  BackupOptions,
  BaiduSearchOptions,
  CommentOptions,
  ImageBedDto,
  MailOptionsDto,
  SEODto,
  UrlDto,
} from '../../common/global/configs/configs.dto'
import {
  ConfigsService,
  IConfig,
} from '../../common/global/configs/configs.service'

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

  validOptions: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  }
  validate = new ValidationPipe(this.validOptions)
  patchAndValid(key: keyof IConfig, value: any) {
    switch (key) {
      case 'url': {
        this.validWithDto(UrlDto, value)
        return this.configs.patch('url', value)
      }
      case 'commentOptions': {
        this.validWithDto(CommentOptions, value)
        return this.configs.patch('commentOptions', value)
      }
      case 'imageBed': {
        this.validWithDto(ImageBedDto, value)
        return this.configs.patch('imageBed', value)
      }
      case 'mailOptions': {
        this.validWithDto(MailOptionsDto, value)
        return this.configs.patch('mailOptions', value)
      }
      case 'seo': {
        this.validWithDto(SEODto, value)
        return this.configs.patch('seo', value)
      }
      case 'backupOptions': {
        this.validWithDto(BackupOptions, value)
        return this.configs.patch('backupOptions', value)
      }
      case 'baiduSearchOptions': {
        this.validWithDto(BaiduSearchOptions, value)

        return this.configs.patch('baiduSearchOptions', value)
      }
      default: {
        throw new UnprocessableEntityException('设置不存在')
      }
    }
  }

  private validWithDto<T extends object>(dto: ClassConstructor<T>, value: any) {
    const validModel = plainToClass(dto, value)
    const errors = validateSync(validModel, this.validOptions)
    if (errors.length > 0) {
      const error = this.validate.createExceptionFactory()(errors as any[])
      throw error
    }
    return true
  }
}
