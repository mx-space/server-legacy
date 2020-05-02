import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { Option } from '@libs/db/models/option.model'
import { SEODto, UrlDto, ImageBedDto, MailOptionsDto } from './configs.dto'

export interface IConfig {
  seo: SEODto
  url: UrlDto
  imageBed: ImageBedDto
  mailOptions: MailOptionsDto
}

@Injectable()
export class ConfigsService {
  public config: IConfig = {
    seo: {
      title: 'mx-space',
      description: 'Hello World~',
    } as SEODto,
    url: {
      wsUrl: 'http://localhost:8080', //todo
      adminUrl: 'http://localhost:9528',
      serverUrl: 'http://localhost:2333',
      webUrl: 'http://localhost:2323',
    } as UrlDto,
    imageBed: {} as ImageBedDto,
    mailOptions: {} as MailOptionsDto,
  }

  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
  ) {
    this.configInit()
  }
  protected async configInit() {
    const configs = await this.optionModel.find().lean()
    configs.map((field) => {
      const name = field.name as keyof IConfig
      const value = field.value
      this.config[name] = value
    })
  }

  public get seo() {
    return this.config.seo
  }

  public get url() {
    return this.config.url
  }

  public get imageBed() {
    return this.config.imageBed
  }

  async setSEO(seo: SEODto) {
    return await this.patch('seo', seo)
  }

  async setUrl(url: UrlDto) {
    return await this.patch('url', url)
  }

  public get<T extends keyof IConfig>(key: T): IConfig[T] {
    return this.config[key]
  }

  public async patch<T extends keyof IConfig>(key: T, data: IConfig[T]) {
    await this.optionModel.updateOne(
      { name: key as string },
      { value: { ...this.config[key], ...data } },
      { upsert: true, omitUndefined: true },
    )
    const newData = (await this.optionModel.findOne({ name: key as string }))
      .value
    this.config[key] = newData

    return this.config[key]
  }
}
