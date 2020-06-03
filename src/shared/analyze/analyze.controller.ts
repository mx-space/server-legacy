import { Controller, Delete, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DocumentType } from '@typegoose/typegoose'
import * as dayjs from 'dayjs'
import { RedisService } from 'nestjs-redis'
import { Analyze } from '../../../libs/db/src/models/analyze.model'
import { Auth } from '../../core/decorators/auth.decorator'
import { PagerDto } from '../base/dto/pager.dto'
import {
  getMonthLength,
  getMonthStart,
  getTodayEarly,
  getWeekStart,
} from '../utils/time'
import { AnalyzeDto } from './analyze.dto'
import { AnalyzeService } from './analyze.service'
import { RedisNames } from '../../../libs/common/src/redis/redis.types'
@Controller('analyze')
@ApiTags('Analyze Routes')
@Auth()
export class AnalyzeController {
  constructor(
    private readonly service: AnalyzeService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async getAnalyze(@Query() query: AnalyzeDto & Partial<PagerDto>) {
    const { from, to = new Date(), page = 1, size = 50 } = query

    const data = await this.service.getRangeAnalyzeData(from, to, {
      limit: ~~size,
      skip: (~~page - 1) * ~~size,
    })
    const total = await this.service.getCallTime()
    const redis = this.redisService.getClient(RedisNames.Access)
    const fromRedisIps = await redis.get('ips')
    const ips = fromRedisIps ? JSON.parse(fromRedisIps) : []
    return {
      ...data,
      total,
      today_ips: ips,
    }
  }

  @Get('today')
  async getAnalyzeToday(@Query() query: Partial<PagerDto>) {
    const { page = 1, size = 50 } = query
    const today = new Date()
    const todayEarly = getTodayEarly(today)
    return await this.service.getRangeAnalyzeData(todayEarly, today, {
      limit: ~~size,
      skip: (~~page - 1) * ~~size,
    })
  }

  @Get('week')
  async getAnalyzeWeek(@Query() query: Partial<PagerDto>) {
    const { page = 1, size = 50 } = query
    const today = new Date()
    const weekStart = getWeekStart(today)
    return await this.service.getRangeAnalyzeData(weekStart, today, {
      limit: ~~size,
      skip: (~~page - 1) * ~~size,
    })
  }

  @Get('fragment')
  async getFragment() {
    const now = new Date()
    const todayEarly = getTodayEarly(now)
    const todayData: Pick<
      DocumentType<Analyze>,
      '_id' | 'ip' | 'ua' | 'created' | 'typegooseName'
    >[] = (await this.service.getRangeAnalyzeData(todayEarly, now, {
      withPaginator: false,
    })) as any

    // today fragment
    const nowHour = now.getHours()
    const todayHours = await Promise.all(
      Array(24)
        .fill(undefined)
        .map(async (v, i) => {
          const from = dayjs(now)
            .set('hour', i)
            .set('minute', 0)
            .set('second', 0)
          const to = from.add(1, 'hour')
          const ipCount = await this.service.getRangeAnalyzeIpCount(
            from.toDate(),
            to.toDate(),
          )

          return [
            {
              hour: i === nowHour ? '现在' : i + '时',
              key: 'ip',
              value: ipCount,
            },
            {
              hour: i === nowHour ? '现在' : i + '时',
              key: 'pv',
              value: 0,
            },
          ]
        }),
    )

    for await (const d of todayData) {
      const time = new Date(d.created)
      const hour = time.getHours()
      todayHours[hour][1].value = -~todayHours[hour][1].value
    }
    // week fragment
    const weekData: Pick<
      DocumentType<Analyze>,
      '_id' | 'ip' | 'ua' | 'created' | 'typegooseName'
    >[] = (await this.service.getRangeAnalyzeData(getWeekStart(now), now, {
      withPaginator: false,
    })) as any

    const getWeekLabel = (index: number) =>
      ['日', '一', '二', '三', '四', '五', '六'][index]
    const todayDay = now.getDay()
    const weeks = await Promise.all(
      Array(7)
        .fill(undefined)
        .map(async (v, i) => {
          const from = dayjs(now)
            .set('day', i)
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
          const to = from.add(1, 'day')
          const ipCount = await this.service.getRangeAnalyzeIpCount(
            from.toDate(),
            to.toDate(),
          )
          const day = i === todayDay ? '今天' : '周' + getWeekLabel(i)
          return [
            {
              day,
              key: 'ip',
              value: ipCount,
            },
            {
              day,
              key: 'pv',
              value: 0,
            },
          ]
        }),
    )

    for await (const d of weekData) {
      const time = new Date(d.created)
      const day = time.getDay()
      weeks[day][1].value = -~weeks[day][1].value
    }

    // month fragment
    const month = now.getMonth() + 1
    const monthEveryDays = await Promise.all(
      Array(getMonthLength(month, now.getFullYear()))
        .fill(undefined)
        .map(async (v, i) => {
          const from = dayjs(now)
            .set('hour', 0)
            .set('date', i + 1)
            .set('minute', 0)
            .set('second', 0)
          const to = from.add(1, 'day')
          const ipCount = await this.service.getRangeAnalyzeIpCount(
            from.toDate(),
            to.toDate(),
          )
          const date = `${month}-${i + 1}`
          return [
            { date, key: 'ip', value: ipCount },
            { date, key: 'pv', value: 0 },
          ]
        }),
    )
    const thisMonthData: Pick<
      DocumentType<Analyze>,
      '_id' | 'ip' | 'ua' | 'created' | 'typegooseName'
    >[] = (await this.service.getRangeAnalyzeData(getMonthStart(now), now, {
      withPaginator: false,
    })) as any
    for await (const d of thisMonthData) {
      const time = new Date(d.created)
      const date = time.getDate() - 1

      monthEveryDays[date][1].value = -~monthEveryDays[date][1].value
    }
    return {
      today: todayHours.flat(2),
      weeks: weeks.flat(2),
      months: monthEveryDays.flat(2),
    }
  }
  @Delete()
  async clearAnalyze() {
    await this.service.clearAnalyzeRange()
    return 'OK'
  }
}
