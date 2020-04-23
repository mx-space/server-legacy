import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { Option } from '@libs/db/models/option.model'
import { SEODto } from './configs.dto'

@Injectable()
export class ConfigsService {
  public seo = {
    title: 'mx-space',
    description: 'Hello World~',
  } as SEODto

  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
  ) {
    optionModel
      .findOne({ name: 'sec' })
      .lean()
      .then((res) => {
        if (res) {
          this.seo = res.value as SEODto
        }
      })
  }

  public async setSEO(seo: SEODto) {
    await this.optionModel.updateOne(
      { name: 'seo' },
      { value: { ...seo } },
      { upsert: true, omitUndefined: true },
    )

    const newSeo = (await this.optionModel.findOne({ name: 'seo' }))
      .value as SEODto
    this.patch('seo', newSeo)
    return this.seo
  }

  private patch<T>(key: keyof this, data: T) {
    this[key] = { ...this[key], ...data }
  }
}
