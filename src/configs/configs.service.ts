import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { Option } from '@libs/db/models/option.model'
import { SEODto, UrlDto } from './configs.dto'

@Injectable()
export class ConfigsService {
  public seo = {
    title: 'mx-space',
    description: 'Hello World~',
  } as SEODto

  public url: UrlDto = {
    wsUrl: 'http://localhost:8080', //todo
    adminUrl: 'http://localhost:9528',
    serverUrl: 'http://localhost:2333',
    webUrl: 'http://localhost:2323',
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
      const name = field.name as keyof this
      const value = field.value
      this[name] = value
    })
  }

  public async setSEO(seo: SEODto) {
    return await this.patch('seo', seo)
  }
  public async setUrl(url: UrlDto) {
    return await this.patch('url', url)
  }
  private async patch<T>(key: keyof this, data: T) {
    await this.optionModel.updateOne(
      { name: key as string },
      { value: { ...this[key], ...data } },
      { upsert: true, omitUndefined: true },
    )

    const newData = (await this.optionModel.findOne({ name: key as string }))
      .value
    this[key] = newData
    return this[key]
  }
}
