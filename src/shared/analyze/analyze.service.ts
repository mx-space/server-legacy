import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import dayjs = require('dayjs')
import { merge } from 'lodash'
import { InjectModel } from 'nestjs-typegoose'
import { Analyze } from '../../../libs/db/src/models/analyze.model'
import { Option } from '../../../libs/db/src/models/option.model'
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
  async cleanAnalyzeRange(range: { from?: Date; to?: Date }) {
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
  }

  async getIpAndPvAggregate(
    type: 'day' | 'week' | 'month' | 'all',
    returnObj?: boolean,
  ) {
    let cond = {}
    const now = dayjs()
    const beforeDawn = now.set('minute', 0).set('second', 0).set('hour', 0)
    switch (type) {
      case 'day': {
        cond = {
          created: {
            $gte: beforeDawn.toDate(),
          },
        }
        break
      }
      case 'month': {
        cond = {
          created: {
            $gte: beforeDawn.set('day', -30).toDate(),
          },
        }
        break
      }
      case 'week': {
        cond = {
          created: {
            $gte: beforeDawn.set('day', -7).toDate(),
          },
        }
        break
      }
      case 'all':
      default: {
        break
      }
    }

    const res = await this.model.aggregate([
      { $match: cond },
      {
        $project: {
          _id: 1,
          created: 1,
          hour: {
            $dateToString: {
              format: '%H',
              date: { $subtract: ['$created', 0] },
              timezone: '+08:00',
            },
          },
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $subtract: ['$created', 0] },
              timezone: '+08:00',
            },
          },
        },
      },
      {
        $group: {
          _id: type === 'day' ? '$hour' : '$date',

          pv: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          ...(type === 'day' ? { hour: '$_id' } : { date: '$_id' }),
          pv: 1,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ])

    const res2 = await this.model.aggregate([
      { $match: cond },
      {
        $project: {
          _id: 1,
          created: 1,
          ip: 1,
          hour: {
            $dateToString: {
              format: '%H',
              date: { $subtract: ['$created', 0] },
              timezone: '+08:00',
            },
          },
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $subtract: ['$created', 0] },
              timezone: '+08:00',
            },
          },
        },
      },
      {
        $group: {
          _id:
            type === 'day'
              ? { ip: '$ip', hour: '$hour' }
              : { ip: '$ip', date: '$date' },
        },
      },

      {
        $group: {
          _id: type === 'day' ? '$_id.hour' : '$_id.date',
          ip: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          ...(type === 'day' ? { hour: '$_id' } : { date: '$_id' }),
          ip: 1,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ])
    const arr = merge(res, res2)
    if (returnObj) {
      const obj = {}
      for (const item of arr) {
        obj[item.hour || item.date] = item
      }

      return obj
    }
    return arr
  }
}
