import { RedisNames } from '@libs/common/redis/redis.types'
import { Analyze } from '@libs/db/models/analyze.model'
import { Option } from '@libs/db/models/option.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import dayjs = require('dayjs')
import { merge } from 'lodash'
import { RedisService } from 'nestjs-redis'
import { InjectModel } from 'nestjs-typegoose'

import { BaseService } from '../base/base.service'

@Injectable()
export class AnalyzeService extends BaseService<Analyze> {
  constructor(
    @InjectModel(Option)
    private readonly options: ReturnModelType<typeof Option>,
    @InjectModel(Analyze)
    private readonly model: ReturnModelType<typeof Analyze>,
    private readonly redisService: RedisService,
  ) {
    super(model)
  }

  async getRangeAnalyzeData(
    from = new Date(new Date().getTime() - 1000 * 24 * 3600 * 3),
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
          timestamp: {
            $gte: from,
          },
        },
        {
          timestamp: {
            $lte: to,
          },
        },
      ],
    }

    const data = withPaginator
      ? await this.findWithPaginator(condition, {
          sort: { timestamp: -1 },
          limit,
          skip,
        })
      : await this.model.find(condition).sort({ timestamp: -1 }).lean()

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
          timestamp: {
            $gte: from,
          },
        },
        {
          timestamp: {
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
          timestamp: {
            $gte: beforeDawn.toDate(),
          },
        }
        break
      }
      case 'month': {
        cond = {
          timestamp: {
            $gte: beforeDawn.set('day', -30).toDate(),
          },
        }
        break
      }
      case 'week': {
        cond = {
          timestamp: {
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
          timestamp: 1,
          hour: {
            $dateToString: {
              format: '%H',
              date: { $subtract: ['$timestamp', 0] },
              timezone: '+08:00',
            },
          },
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $subtract: ['$timestamp', 0] },
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
          timestamp: 1,
          ip: 1,
          hour: {
            $dateToString: {
              format: '%H',
              date: { $subtract: ['$timestamp', 0] },
              timezone: '+08:00',
            },
          },
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $subtract: ['$timestamp', 0] },
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

  async getRangeOfTopPathVisitor(from?: Date, to?: Date): Promise<any[]> {
    from = from ?? new Date(new Date().getTime() - 1000 * 24 * 3600 * 7)
    to = to ?? new Date()

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: from,
            $lte: to,
          },
        },
      },
      {
        $group: {
          _id: '$path',
          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
      {
        $project: {
          _id: 0,
          path: '$_id',
          count: 1,
        },
      },
    ]

    const res = await this.model.aggregate(pipeline).exec()

    return res
  }

  async getTodayAccessIp(): Promise<string[]> {
    const redis = this.redisService.getClient(RedisNames.Access)
    const fromRedisIps = await redis.get('ips')
    const ips = fromRedisIps ? JSON.parse(fromRedisIps) : []
    return ips
  }
}
