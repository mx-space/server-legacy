import { Recently } from '@libs/db/models/recently.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { BaseService } from 'apps/graphql/src/shared/base/base.service'
import { InjectModel } from 'nestjs-typegoose'
import { RecentlyDto } from './recently.dto'

@Injectable()
export class RecentlyService extends BaseService<Recently> {
  constructor(
    @InjectModel(Recently)
    private readonly model: ReturnModelType<typeof Recently>,
  ) {
    super(model)
  }

  async getOffset({
    before,
    size,
    after,
  }: {
    before?: string
    size?: number
    after?: string
  }) {
    size = size ?? 10

    return await this.model
      .find(
        after
          ? {
              _id: {
                $gt: after,
              },
            }
          : before
          ? { _id: { $lt: before } }
          : {},
      )
      .limit(size)
      .sort({ _id: -1 })
      .lean()
  }
  async getLatestOne() {
    return await this.model.findOne().sort({ created: -1 }).lean()
  }

  // @ts-ignore
  async create(model: RecentlyDto) {
    return await this.model.create({
      content: model.content,
      language: model.language,
      project: model.project,
    })
  }

  // @ts-ignore
  async delete(id: string) {
    try {
      await this.model.deleteOne({
        _id: id,
      })

      return true
    } catch {
      return false
    }
  }
}
