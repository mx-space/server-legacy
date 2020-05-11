import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { Option } from '../../../libs/db/src/models/option.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { Analyze } from '../../../libs/db/src/models/analyze.model'
import { BaseService } from '../base/base.service'

@Injectable()
export class AnalyzeService extends BaseService<Analyze> {
  constructor(
    @InjectModel(Option)
    private readonly options: ReturnModelType<typeof Option>,
    @InjectModel(Analyze)
    private readonly model: ReturnModelType<typeof Analyze>,
  ) {
    super(model)
  }

  async getRangeAnalyzeData(
    from = new Date(new Date().getTime() - 1000 * 24 * 3600),
    to = new Date(),
    options?: {
      limit?: number
      skip?: number
      withPaginator?: boolean
    },
  ) {
    const { limit = 50, skip = 0, withPaginator = true } = options || {}
    const condition = {
      $and: [
        {
          created: {
            $gte: from,
          },
        },
        {
          created: {
            $lte: to,
          },
        },
      ],
    }
    const data = withPaginator
      ? await this.findWithPaginator(condition, {
          sort: { created: -1 },
          limit,
          skip,
        })
      : await this.model.find(condition).sort({ created: -1 }).lean()

    return data
  }

  async getCallTime() {
    const callTime =
      (
        await this.options
          .findOne({
            name: 'apiCallTime',
          })
          .lean()
      )?.value || 0

    const uv =
      (
        await this.options
          .findOne({
            name: 'uv',
          })
          .lean()
      )?.value || 0

    return { callTime, uv }
  }
  async clearAnalyzeRange(range?: { from?: Date; to?: Date }) {
    if (range) {
      const { from, to } = range

      await this.model.deleteMany({
        $and: [
          {
            created: {
              $gte: from,
            },
          },
          {
            created: {
              $lte: to,
            },
          },
        ],
      })
    } else {
      await this.model.deleteMany({})
    }
  }
}
